;; Bootcamp Token V3 - Enhanced SIP-010 Implementation
;; Version 3: Advanced features with pause, cap, and admin controls

;; Implement SIP-010 fungible token trait
;;(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard.sip-010-trait)

;; Define the token
(define-fungible-token bootcamp-token)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-contract-paused (err u103))
(define-constant err-exceeds-max-supply (err u104))
(define-constant err-invalid-amount (err u105))
(define-constant err-unauthorized (err u106))

;; Token metadata
(define-constant token-name "Bootcamp Token V3")
(define-constant token-symbol "BTCV3")
(define-constant token-decimals u6)
(define-constant token-uri u"https://stacksbootcamp.dev/btcv3.json")
(define-constant max-supply u1000000000000) ;; 1 million tokens with 6 decimals

;; Data variables
(define-data-var contract-paused bool false)
(define-data-var total-minted uint u0)

;; Data maps
(define-map authorized-minters principal bool)
(define-map user-allowances { owner: principal, spender: principal } uint)

;; Events (using print for simplicity)
(define-private (emit-transfer (from principal) (to principal) (amount uint))
  (print { event: "transfer", from: from, to: to, amount: amount })
)

(define-private (emit-mint (to principal) (amount uint))
  (print { event: "mint", to: to, amount: amount })
)

(define-private (emit-burn (from principal) (amount uint))
  (print { event: "burn", from: from, amount: amount })
)

;; SIP-010 required functions
(define-read-only (get-name)
  (ok token-name)
)

(define-read-only (get-symbol)
  (ok token-symbol)
)

(define-read-only (get-decimals)
  (ok token-decimals)
)

(define-read-only (get-balance (user principal))
  (ok (ft-get-balance bootcamp-token user))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply bootcamp-token))
)

(define-read-only (get-token-uri)
  (ok (some token-uri))
)

;; Enhanced read-only functions
(define-read-only (get-max-supply)
  (ok max-supply)
)

(define-read-only (is-paused)
  (ok (var-get contract-paused))
)

(define-read-only (is-authorized-minter (user principal))
  (ok (default-to false (map-get? authorized-minters user)))
)

(define-private (is-authorized-minter-internal (user principal))
  (default-to false (map-get? authorized-minters user))
)

(define-read-only (get-allowance (owner principal) (spender principal))
  (ok (default-to u0 (map-get? user-allowances { owner: owner, spender: spender })))
)

;; Admin functions
(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set contract-paused true)
    (ok true)
  )
)

(define-public (unpause-contract)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set contract-paused false)
    (ok true)
  )
)

(define-public (add-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set authorized-minters minter true)
    (ok true)
  )
)

(define-public (remove-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-delete authorized-minters minter)
    (ok true)
  )
)

;; SIP-010 transfer function
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    (asserts! (is-eq from tx-sender) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-transfer? bootcamp-token amount from to))
    (emit-transfer from to amount)
    (ok true)
  )
)

;; Enhanced mint function with supply cap
(define-public (mint (amount uint) (to principal))
  (let ((current-supply (ft-get-supply bootcamp-token)))
    (begin
      (asserts! (not (var-get contract-paused)) err-contract-paused)
      (asserts! (or (is-eq tx-sender contract-owner) (is-authorized-minter-internal tx-sender)) err-unauthorized)
      (asserts! (> amount u0) err-invalid-amount)
      (asserts! (<= (+ current-supply amount) max-supply) err-exceeds-max-supply)
      (try! (ft-mint? bootcamp-token amount to))
      (var-set total-minted (+ (var-get total-minted) amount))
      (emit-mint to amount)
      (ok true)
    )
  )
)

;; Enhanced burn function
(define-public (burn (amount uint) (from principal))
  (begin
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    (asserts! (is-eq from tx-sender) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= (ft-get-balance bootcamp-token from) amount) err-insufficient-balance)
    (try! (ft-burn? bootcamp-token amount from))
    (emit-burn from amount)
    (ok true)
  )
)

;; Allowance functions (for future DEX integration)
(define-public (approve (spender principal) (amount uint))
  (begin
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    (asserts! (> amount u0) err-invalid-amount)
    (map-set user-allowances { owner: tx-sender, spender: spender } amount)
    (ok true)
  )
)

(define-public (transfer-from (owner principal) (to principal) (amount uint))
  (let ((allowance (unwrap! (get-allowance owner tx-sender) err-insufficient-balance)))
    (begin
      (asserts! (not (var-get contract-paused)) err-contract-paused)
      (asserts! (> amount u0) err-invalid-amount)
      (asserts! (>= allowance amount) err-insufficient-balance)
      (try! (ft-transfer? bootcamp-token amount owner to))
      (map-set user-allowances 
        { owner: owner, spender: tx-sender } 
        (- allowance amount)
      )
      (emit-transfer owner to amount)
      (ok true)
    )
  )
)

;; Batch operations
(define-public (batch-transfer (recipients (list 10 { to: principal, amount: uint })))
  (begin
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    (fold batch-transfer-helper recipients (ok true))
  )
)

(define-private (batch-transfer-helper (recipient { to: principal, amount: uint }) (previous-response (response bool uint)))
  (match previous-response
    ok-value (transfer (get amount recipient) tx-sender (get to recipient) none)
    err-value (err err-value)
  )
)

;; Emergency functions (owner only)
(define-public (emergency-burn (from principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (>= (ft-get-balance bootcamp-token from) amount) err-insufficient-balance)
    (try! (ft-burn? bootcamp-token amount from))
    (emit-burn from amount)
    (ok true)
  )
)

;; Initialize contract (set owner as authorized minter)
(map-set authorized-minters contract-owner true)

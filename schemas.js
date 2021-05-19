const AssetSchema = `
  { 
    address
    symbol
    decimals
  }
`

const CompanySchema = `
  { _id
    owner
    companyName
    companyEmail
    primaryAddress
    aboutCompany
    contactName
    telegram
    discord
    website
    twitter
    createdAt
    updatedAt 
  } 
`

const PoolDelegateSchema = `
  {
    _id
    owner
    name
    website
    twitter
    telegram
    linkedIn
    companyName
    aboutBusiness
    allowList
    createdAt
    updatedAt
  }
`

const PoolPositionSchema = ` {
  id
  poolTokenBalance
  custodyAllowance
  depositDate
  withdrawCooldown
  poolTokensStaked
  rewardPaid
  stake
  unstakeCooldown
  stakeDate
}`

const PoolSchema = `
  {
    _id   
    poolName 
    stakeAsset ${AssetSchema}
    stakingFee
    delegateFee
    poolDelegate ${PoolDelegateSchema}
    numActiveLoans
    contractAddress
    liquidityLocker
    liquidityAsset ${AssetSchema}
    poolPositions${PoolPositionSchema}
    poolTokenTotalSupply
    totalPrincipalRepaid
    liquidityCap
    stakeLocker
    ongoingFee
    stakingApy
    liquidity
    strategy
    balance
    stake
    allowedLPs
    lpApy
    name
    state
    currentLoaned
    totalInterestEarned
    myInterestEarned
    transactionHash
    myLiquidity
    myBalance
    createdAt
    updatedAt
  }
`

const LoanSchema = `
 {
    _id
    owner
    borrower ${CompanySchema}
    requestAmount
    loanNumber
    liquidityAsset ${AssetSchema}
    collateralAsset ${AssetSchema}
    collateralRatio
    contractAddress
    transactionHash
    paymentStructure
    paymentIntervalDays
    paymentsRemaining
    collateralAmount
    claimableAmount
    drawdownAmount
    nextPaymentDue
    principalOwed
    amountFunded
    numLenders
    purpose
    termDays
    state
    apr
    createdAt
    updatedAt
  }
`

module.exports = { PoolSchema }
import { DappStakingAddStakeDialog } from '@components/recipes/AddStakeDialog'
import type { Account } from '@domains/accounts'
import { useAddStakeForm, type Stake } from '@domains/staking/dappStaking'
import type { AstarPrimitivesDappStakingSmartContract } from '@polkadot/types/lookup'
import { CircularProgressIndicator } from '@talismn/ui'
import { useEffect, useState } from 'react'
import DappPickerDialog from './DappPickerDialog'

type DappAddStakeDialogProps = {
  account: Account
  stake: Stake
  dapp: string | AstarPrimitivesDappStakingSmartContract | Uint8Array | { Evm: any } | { Wasm: any }
  onRequestDismiss: () => void
}

const DappAddStakeDialog = (props: DappAddStakeDialogProps) => {
  const { input, setAmount, available, resulting, error, extrinsic, ready } = useAddStakeForm(
    props.account,
    props.stake,
    props.dapp
  )

  useEffect(
    () => {
      if (extrinsic.state === 'loading' && extrinsic.contents?.status.isInBlock) {
        props.onRequestDismiss()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extrinsic.contents?.status?.isInBlock]
  )

  return (
    <DappStakingAddStakeDialog
      confirmState={extrinsic.state === 'loading' ? 'pending' : !ready ? 'disabled' : undefined}
      isError={error !== undefined}
      availableToStake={available.decimalAmount.toHuman()}
      amount={input.amount}
      onChangeAmount={setAmount}
      onRequestMaxAmount={() => setAmount(available.decimalAmount.toString())}
      fiatAmount={input.localizedFiatAmount ?? ''}
      newAmount={resulting.decimalAmount?.toHuman() ?? <CircularProgressIndicator size="1em" />}
      newFiatAmount={resulting.localizedFiatAmount ?? <CircularProgressIndicator size="1em" />}
      onConfirm={() => {
        void extrinsic.signAndSend(props.account.address)
      }}
      inputSupportingText={error?.message}
      onDismiss={props.onRequestDismiss}
    />
  )
}

type MultiDappsAddStakeDialogProps = {
  account: Account
  stake: Stake
  onRequestDismiss: () => void
}

const MultiDappAddStakeDialog = (props: MultiDappsAddStakeDialogProps) => {
  const [dapp, setDapp] = useState<AstarPrimitivesDappStakingSmartContract>()

  return dapp === undefined ? (
    <DappPickerDialog
      title="Select a DApp to increase stake"
      stake={props.stake}
      onSelect={setDapp}
      onRequestDismiss={props.onRequestDismiss}
    />
  ) : (
    <DappAddStakeDialog
      account={props.account}
      stake={props.stake}
      dapp={dapp}
      onRequestDismiss={props.onRequestDismiss}
    />
  )
}

type AddStakeDialogProps = {
  account: Account
  stake: Stake
  onRequestDismiss: () => void
}

const AddStakeDialog = (props: AddStakeDialogProps) => {
  if (props.stake.dapps.length === 1) {
    return (
      <DappAddStakeDialog
        account={props.account}
        stake={props.stake}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        dapp={props.stake.dapps.at(0)?.[0]!}
        onRequestDismiss={props.onRequestDismiss}
      />
    )
  }

  if (props.stake.dapps.length > 1) {
    return (
      <MultiDappAddStakeDialog account={props.account} stake={props.stake} onRequestDismiss={props.onRequestDismiss} />
    )
  }

  return null
}

export default AddStakeDialog
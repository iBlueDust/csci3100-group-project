import React from 'react'

import NewMarketListingModal, {
  NewMarketListingModalProps,
} from './NewMarketListingModal'

export type EditMarketListingModalProps = Exclude<
  NewMarketListingModalProps,
  'isEditing'
>

const EditMarketListingModal: React.FC<EditMarketListingModalProps> = (
  props,
) => {
  return <NewMarketListingModal {...props} isEditing={true} />
}

export default EditMarketListingModal

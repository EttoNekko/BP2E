import { gql } from '@apollo/client';

export const mutateUserByAddress = gql`
  mutation ($address: String!, $input: UserInput = {}) {
    userByAddress(address: $address, input: $input) {
      _id
      userName
      gmail
      currentGold
      currentSilver
      currentBronze
      currentNFT
      currentMoney
      currentBoxesOwned {
        boxId
        quantity
      }
    }
  }
`;

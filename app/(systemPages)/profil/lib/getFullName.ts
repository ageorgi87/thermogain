interface GetFullNameParams {
  firstName?: string | null
  lastName?: string | null
}

export const getFullName = ({ firstName, lastName }: GetFullNameParams): string => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  if (firstName) {
    return firstName
  }
  return "Utilisateur"
}

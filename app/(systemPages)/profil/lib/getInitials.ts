interface GetInitialsParams {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

export const getInitials = ({ firstName, lastName, email }: GetInitialsParams): string => {
  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return "U"
}

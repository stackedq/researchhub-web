import { AuthorInstitution, Institution } from "~/components/Institution/lib/types";
import { css, StyleSheet } from "aphrodite";

const AuthorInstitutions = ({ institutions }: { institutions: AuthorInstitution[] }) => {
  return (
    <div>
      {institutions.map((authorInstitution) => (
        <div key={authorInstitution.id}>
          {authorInstitution.institution.displayName}
        </div>
      ))}
    </div>
  )
}

const styles = StyleSheet.create({
})

export default AuthorInstitutions;
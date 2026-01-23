// Internal imports
import { FILM_ROLES_BY_CATEGORY } from '@config/roles';

export interface RoleData {
  /** Map from lowercase aliases/canonical names to canonical names */
  roleAliasMap: Record<string, string>;
  /** List of all canonical role names */
  canonicalRoles: string[];
}

/**
 * Builds role data for client-side autocomplete.
 * Returns a map for alias lookups and a list of canonical roles.
 */
export function buildRoleData(): RoleData {
  const roleAliasMap: Record<string, string> = {};

  for (const rolesObj of Object.values(FILM_ROLES_BY_CATEGORY)) {
    for (const [canonical, aliases] of Object.entries(rolesObj)) {
      roleAliasMap[canonical.toLowerCase()] = canonical;
      for (const alias of aliases) {
        roleAliasMap[alias.toLowerCase()] = canonical;
      }
    }
  }

  const canonicalRoles = Object.values(FILM_ROLES_BY_CATEGORY).flatMap(
    (rolesObj) => Object.keys(rolesObj)
  );

  return { roleAliasMap, canonicalRoles };
}

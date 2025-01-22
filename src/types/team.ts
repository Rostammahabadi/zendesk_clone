import { User } from "./user";

export type TeamUserGroup = {
  teamName?: string;
  userFirstNames?: string[];
  companyId?: string;
  users?: User[];
  team_name?: string;
  company_id?: string;
  team_id?: string;
};
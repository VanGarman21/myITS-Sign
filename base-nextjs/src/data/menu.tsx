import {
  CheckmarkSquaresIcon,
  DocumentIcon,
  FormIcon,
  HomeIcon,
  SettingIcon,
  UserCheckmark,
} from "@/components/atoms/IconParams";
import roles from "@/config/Roles";
import { MenuItem } from "@/types/menu-item";

const menuItem: Array<MenuItem> = [
  {
    name: "beranda",
    url: "/",
    icon: HomeIcon,
    isShown: ({ activeRole }) =>
      ![roles.dosen, roles.mahasiswa, roles.developer].includes(
        activeRole as any
      ),
  },
  {
    name: "verify",
    url: "/verify",
    icon: CheckmarkSquaresIcon,
    isShown: ({ activeRole }) => true,
  },
  {
    name: "table",
    url: "/tandatangan",
    icon: FormIcon,
    isShown: ({ activeRole }) => true,
  },
  {
    name: "specimen",
    url: "/manage-specimen",
    icon: UserCheckmark,
    isShown: ({ activeRole }) => true,
  },
];

const menuItemInsights: Array<MenuItem> = [
  {
    name: "pengaturan",
    url: "/pengaturan",
    icon: SettingIcon,
  },
];

export { menuItem, menuItemInsights };

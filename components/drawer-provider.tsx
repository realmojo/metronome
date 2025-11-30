import { DrawerContent } from "@/components/drawer-content";
import { createContext, ReactNode, useState } from "react";
import { Drawer } from "react-native-drawer-layout";
import { useTheme } from "@/contexts/theme-context";
import { Colors } from "@/constants/theme";

export type DrawerContextType = {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

export const DrawerContext = createContext<DrawerContextType | undefined>(
  undefined
);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { effectiveTheme } = useTheme();

  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);
  const toggleDrawer = () => setOpen((prev) => !prev);

  const drawerBackgroundColor =
    effectiveTheme === "dark"
      ? Colors.dark.background
      : Colors.light.background;

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, toggleDrawer }}>
      <Drawer
        open={open}
        onOpen={openDrawer}
        onClose={closeDrawer}
        renderDrawerContent={() => <DrawerContent />}
        drawerStyle={{
          backgroundColor: drawerBackgroundColor,
        }}
      >
        {children}
      </Drawer>
    </DrawerContext.Provider>
  );
}

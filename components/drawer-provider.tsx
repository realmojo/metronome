import { DrawerContent } from "@/components/drawer-content";
import { createContext, ReactNode, useState } from "react";
import { Drawer } from "react-native-drawer-layout";
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

  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);
  const toggleDrawer = () => setOpen((prev) => !prev);

  const drawerBackgroundColor = Colors.dark.background;

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

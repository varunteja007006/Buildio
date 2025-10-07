import { create } from "zustand";

type BreadCrumb = Array<{
  isPage: boolean;
  href: string | null;
  label: string;
}>;

type BreadCrumbsStore = {
  breadCrumbs: BreadCrumb | null;
  actions: {
    setBreadCrumbs: (breadCrumbs: BreadCrumb | null) => void;
  };
};

const useBreadCrumbsStore = create<BreadCrumbsStore>((set) => ({
  breadCrumbs: null,
  actions: {
    setBreadCrumbs: (breadCrumbs) => set(() => ({ breadCrumbs })),
  },
}));

export const breadCrumbsStore = {
  useGetBreadCrumbs: () => {
    return useBreadCrumbsStore((state) => state.breadCrumbs);
  },
  useBreadCrumbsAction: () => {
    return useBreadCrumbsStore((state) => state.actions);
  },
};

import { extract, scrape } from "@/app/actions";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

export const useScrapeForm = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [drafts, setDrafts] = useState<{ draft: string; date: Date }[]>([]);
  const [tabs, setTabs] = useState<{ tab: string; selector: string }[]>([]);

  const { register, handleSubmit, watch } = useForm<{
    url: string;
    selector: string;
  }>();

  const url = watch("url");
  const selector = watch("selector");

  const scrapeMutation = useMutation({
    mutationFn: async () => scrape(url.replaceAll("https://", "")),
    onSuccess: (data) => {
      setCurrentTab(tabs.length);
      setTabs([...tabs, { tab: url.replaceAll("https://", ""), selector: "" }]);
      setDrafts([...drafts, { draft: data, date: new Date() }]);
    },
    onError: (err) => console.error(err),
  });

  const extractMutation = useMutation({
    mutationFn: async () =>
      extract(
        "https://" + tabs.find((_, index) => index === currentTab)?.tab,
        selector,
      ),
    onSuccess: (data) => {
      setCurrentTab(tabs.length);
      setTabs([...tabs, { tab: tabs[currentTab].tab, selector }]);
      setDrafts([...drafts, { draft: data, date: new Date() }]);
    },
    onError: (err) => console.error(err),
  });

  const onSubmitUrl: SubmitHandler<{ url: string }> = () =>
    toast.promise(scrapeMutation.mutateAsync(), {
      error: "Something went wrong...",
      loading: "Loading...",
      success: () => url + " was scraped successfully",
    });

  const onSubmitSelector: SubmitHandler<{ selector: string }> = () =>
    toast.promise(extractMutation.mutateAsync(), {
      error: "Something went wrong...",
      loading: "Loading...",
      success: () => selector + " was used to extract data successfully",
    });

  return {
    register,
    handleSubmit,
    onSubmitUrl,
    onSubmitSelector,
    drafts,
    currentTab,
    setCurrentTab,
    tabs,
  };
};

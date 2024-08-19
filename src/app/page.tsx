"use client";

import { cn } from "@/utils/cn";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { extract, scrape } from "./actions";

export default function Page() {
  const [tab, setTab] = useState(0);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [tabs, setTabs] = useState<{ tab: string; selector: string }[]>([]);

  const { register, handleSubmit, watch, setValue } = useForm<{
    url: string;
    selector: string;
  }>();

  const url = watch("url");
  const selector = watch("selector");

  const scrapeMutation = useMutation({
    mutationFn: async () => scrape(url.replaceAll("https://", "")),
    onSuccess: (data) => {
      setTab(tabs.length);
      setValue("url", "");
      setTabs([
        ...tabs,
        {
          tab: url.replaceAll("https://", ""),
          selector: "",
        },
      ]);
      setDrafts([...drafts, data]);
    },
    onError: (err) => console.error(err),
  });

  const extractMutation = useMutation({
    mutationFn: async () =>
      extract(
        "https://" + tabs.find((_, index) => index === tab)?.tab,
        selector,
      ),
    onSuccess: (data) => {
      setTab(tabs.length);
      setValue("selector", "");
      setTabs([
        ...tabs,
        {
          tab: tabs[tab].tab,
          selector,
        },
      ]);
      setDrafts([...drafts, data]);
    },
    onError: (err) => console.error(err),
  });

  const onSubmitUrl: SubmitHandler<{ url: string }> = (data) =>
    toast.promise(scrapeMutation.mutateAsync(), {
      error: "Something went wrong...",
      loading: "Loading...",
      success: () => data.url + " was scraped successfully",
    });

  const onSubmitSelector: SubmitHandler<{ selector: string }> = (data) => {
    toast.promise(extractMutation.mutateAsync(), {
      error: "Something went wrong...",
      loading: "Loading...",
      success: () => data.selector + " was used to extract data successfully",
    });
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-y-6 px-4 py-12">
      <div className="flex flex-col gap-y-4">
        <section className="mx-auto flex max-w-sm flex-col gap-y-3 text-center">
          <header>
            <h1 className="text-4xl font-bold text-gray-900">Scrape Next</h1>
          </header>
          <p className="text-gray-500">
            Next.js application for scraping HTML content from a specified URL.
          </p>
        </section>
        <form onSubmit={handleSubmit(onSubmitUrl)}>
          <label
            htmlFor="url"
            className="sr-only block text-sm font-medium leading-6 text-gray-900"
          >
            URL
          </label>
          <div className="mt-2 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500">
              https://
            </span>
            <input
              id="url"
              type="text"
              placeholder="www.example.com"
              className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-gray-300"
              autoFocus
              {...register("url")}
            />
          </div>
        </form>
        <nav
          aria-label="Tabs"
          className="mr-auto flex max-w-full flex-row-reverse gap-x-4 overflow-x-scroll whitespace-nowrap px-0.5 py-2"
        >
          {tabs
            .map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setTab(index);
                  setValue("url", tabs[index].tab);
                }}
                className={cn(
                  index === tab
                    ? "bg-white text-gray-700 shadow-md"
                    : "text-gray-500 hover:text-gray-700",
                  "rounded-md px-3 py-2 text-sm font-medium transition-all duration-300",
                )}
              >
                {item.tab} {item.selector && `(${item.selector})`}
              </button>
            ))
            .reverse()}
        </nav>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        {!!drafts.length && (
          <motion.div
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={tab}
            className="rounded-md bg-white shadow-md"
          >
            <nav className="flex flex-col justify-between gap-4 border-b p-4 sm:flex-row sm:items-center">
              <h6 className="font-medium leading-6 tracking-wide">
                {drafts.find((_, index) => index === tab)?.length} characters
              </h6>
              <form
                onSubmit={handleSubmit(onSubmitSelector)}
                className="flex items-center gap-x-4"
              >
                <input
                  id="url"
                  type="text"
                  placeholder="(e.g., div.content, ul > li)"
                  className="block w-full min-w-0 flex-1 rounded-md border-0 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-gray-300"
                  autoFocus
                  {...register("selector")}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      drafts.find((_, index) => index === tab) ?? "",
                    );
                    toast.success("Copied to clipboard!");
                  }}
                >
                  <Square2StackIcon className="h-6 w-6 text-gray-500" />
                </button>
              </form>
            </nav>
            <pre className="h-96 overflow-auto whitespace-pre p-4">
              {drafts.find((_, index) => index === tab)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

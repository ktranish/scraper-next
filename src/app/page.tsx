"use client";

import { cn } from "@/utils/cn";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { extract, scrape } from "./actions";

export default function Page() {
  const [currentTab, setCurrentTab] = useState(0);
  const [drafts, setDrafts] = useState<{ draft: string; date: Date }[]>([]);
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
      setCurrentTab(tabs.length);
      setValue("url", "");
      setTabs([
        ...tabs,
        {
          tab: url.replaceAll("https://", ""),
          selector: "",
        },
      ]);
      setDrafts([
        ...drafts,
        {
          draft: data,
          date: new Date(),
        },
      ]);
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
      setValue("selector", "");
      setTabs([
        ...tabs,
        {
          tab: tabs[currentTab].tab,
          selector,
        },
      ]);
      setDrafts([
        ...drafts,
        {
          draft: data,
          date: new Date(),
        },
      ]);
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
      <section className="flex flex-col gap-y-4">
        <header>
          <h1 className="text-3xl font-extrabold leading-tight text-gray-800 sm:text-4xl">
            Effortlessly Scrape Websites
          </h1>
        </header>
        <p className="text-base text-gray-600 sm:text-lg">
          Discover how our application simplifies scraping HTML content from any
          specified URL, providing you with the data you need in no time.
        </p>
      </section>

      <section aria-labelledby="url-form-section">
        <header>
          <h2 id="url-form-section" className="sr-only">
            Enter URL for Scraping
          </h2>
        </header>
        <form onSubmit={handleSubmit(onSubmitUrl)}>
          <label
            htmlFor="url"
            className="block text-sm font-medium leading-6 text-gray-900"
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
      </section>

      <section aria-labelledby="tabs-navigation" className="flex">
        <header className="sr-only">
          <h2 id="tabs-navigation">Tab Navigation</h2>
        </header>
        <nav className="mr-auto flex max-w-full flex-row-reverse gap-x-4 overflow-x-scroll whitespace-nowrap py-2">
          {tabs
            .map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setCurrentTab(index);
                  setValue("url", tabs[index].tab);
                }}
                className={cn(
                  index === currentTab
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
      </section>

      <AnimatePresence mode="popLayout">
        {!!drafts.length && (
          <motion.article
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={currentTab}
            className="rounded-md bg-white shadow-md"
          >
            <header className="flex flex-col justify-between gap-4 border-b p-4 sm:flex-row sm:items-center">
              <div className="flex flex-col">
                <h3 className="font-medium leading-6 tracking-wide">
                  {
                    drafts.find((_, index) => index === currentTab)?.draft
                      .length
                  }{" "}
                  characters
                </h3>
                <time
                  className="text-sm text-gray-500"
                  dateTime={
                    drafts
                      .find((_, index) => index === currentTab)
                      ?.date.toISOString() ?? new Date().toISOString()
                  }
                >
                  {formatDistanceToNow(
                    drafts.find((_, index) => index === currentTab)?.date ??
                      new Date(),
                    {
                      addSuffix: true,
                    },
                  )}
                </time>
              </div>
              <form
                onSubmit={handleSubmit(onSubmitSelector)}
                className="flex items-center gap-x-4"
              >
                <label
                  htmlFor="selector-input"
                  className="sr-only block text-sm font-medium leading-6 text-gray-900"
                >
                  CSS Selector
                </label>
                <input
                  id="url"
                  type="text"
                  placeholder="(e.g., div.content, ul > li)"
                  className="block w-full min-w-0 flex-1 rounded-md border-0 py-2.5 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-gray-300"
                  autoFocus
                  {...register("selector")}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      drafts.find((_, index) => index === currentTab)?.draft ??
                        "",
                    );
                    toast.success("Copied to clipboard!");
                  }}
                >
                  <Square2StackIcon className="h-6 w-6 text-gray-500" />
                </button>
              </form>
            </header>
            <pre className="h-96 overflow-auto whitespace-pre p-4 text-sm">
              {drafts.find((_, index) => index === currentTab)?.draft}
            </pre>
          </motion.article>
        )}
      </AnimatePresence>
    </main>
  );
}

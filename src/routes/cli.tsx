import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CodeBlock } from "@/components/snippets/CodeBlock";

export const Route = createFileRoute("/cli")({
  head: () => ({ meta: [{ title: "Cipherline · CLI" }] }),
  component: () => (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl font-medium tracking-tight">CLI</h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">Drive Vaultline and Queryline from the terminal.</p>
        <div className="mt-8 space-y-6">
          <CodeBlock lang="bash" code={`npm install -g @line-stack/cli\n# ~/.linestack/.env → WALLET_PRIVATE_KEY, STORY_RPC_URL, IPFS_*\nlinestack status`} />
          <CodeBlock lang="bash" code={`# Vaultline (real CDR txs)\nnpm run linestack -- vaultline create-vault --name imaging\nnpm run linestack -- vaultline write-secret --uuid <cdrUuid> --file ./meta.json\nnpm run linestack -- vaultline upload-file --file ./scan.png\nnpm run linestack -- vaultline unlock-file --uuid <cdrUuid> --out ./out.bin`} />
          <CodeBlock lang="bash" code={`# Queryline\nnpm run linestack -- queryline create-dataset --name patients\nnpm run linestack -- queryline seed --dataset-id <id> --file ./dataset.json\nnpm run linestack -- queryline add-template --dataset-id <id> --name avg_value_by_region\nnpm run linestack -- queryline request-query --dataset-id <id> --template-id <id> --params '{"region":"EU"}'\nnpm run linestack -- queryline fulfill --request-id <id>\nnpm run linestack -- queryline unlock-result --request-id <id>`} />
        </div>
      </section>
      <SiteFooter />
    </div>
  ),
});

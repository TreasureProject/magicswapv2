import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { fetchPool } from "~/api/pools.server";
import { Container } from "~/components/Container";

export async function loader({ params }: LoaderArgs) {
  invariant(params.id, "Pool ID required");

  const pool = await fetchPool(params.id);
  if (!pool) {
    throw new Response("Pool not found", {
      status: 404,
    });
  }

  return json({ pool });
}

export default function PoolDetailsPage() {
  const { pool } = useLoaderData<typeof loader>();
  return (
    <Container className="py-6 sm:py-10">
      <h1 className="flex items-center text-2xl font-bold uppercase">
        <Link
          to="/pools"
          className="py-2 pl-2 pr-4 text-night-400 transition-colors hover:text-night-100"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        {pool.name} Pool
      </h1>
    </Container>
  );
}

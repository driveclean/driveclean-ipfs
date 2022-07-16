import Head from "next/head";
import Link from "next/link";

export default function Index() {
  return (
    <>
      <Head>
        <title>DriveClean</title>
        <meta property="og:title" content="DriveClean" key="title" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <div className="min-w-screen min-h-screen flex flex-col justify-center items-center bg-[#27DF63] text-[#181815]">
        <div className="px-8 max-w-2xl">
          <div className="text-center text-2xl sm:text-3xl font-medium">DriveClean Is Coming Soon</div>
          <div className="mt-4 text-base sm:text-lg">
            <span className="font-light">
              DriveClean is a drive-to-earn web3 app for electric vehicle (EV) drivers. It aims to{" "}
            </span>
            <span className="font-medium">incentivize EV adoption and renewable energy charging.</span>
          </div>
          <div className="mt-2 text-base sm:text-lg font-light">
            EV drivers can earn game tokens just by driving and charging their EV, after they have collected Car NFTs.
            These tokens can be used in game for enhanced experience, or simply traded out for cash.
          </div>
          <div className="relative mt-8 flex justify-around items-center">
            <Link href="https://driveclean.io/alpha" passHref>
              <button className="w-1/3 min-h-12 shadow-md rounded-xl bg-gradient-to-br from-green-300 to-green-200 text-gray-900">
                Try Now
              </button>
            </Link>
            <Link href="https://whitepaper.driveclean.io" passHref>
              <button className="w-1/3 min-h-12 shadow-md border-2 border-[#181815] rounded-xl">Whitepaper</button>
            </Link>
          </div>
          <Link href="mailto:hello@driveclean.io" passHref>
            <div className="mt-4 text-center text-sm underline">Contact Us</div>
          </Link>
        </div>
      </div>
    </>
  );
}

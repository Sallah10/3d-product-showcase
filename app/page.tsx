import Main from "./components/Main/page";

export default function Home() {

  return (
    <>
      {/* flex flex-col items-center w-full bg-gradient-to-b from-blue-50 to-indigo-100 */}
      <div className="overflow-hidden min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        {/* Main component */}
        <Main />
      </div>
    </>
  );
}

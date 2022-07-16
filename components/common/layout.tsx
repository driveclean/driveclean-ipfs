import Footer from "@components/common/footer";
import Header from "@components/common/header";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="w-full max-w-3xl h-full mx-auto flex-1 flex flex-col items-center sm:justify-center">
      <Header />
      {/* 父级元素设为flex，然后将flex-grow设为1使得内容部分始终充满容器（整个屏幕） */}
      <div className="relative w-full flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  );
}

import { Outlet } from "react-router-dom";

import Sidebar from "../widgets/Sidebar/Sidebar";
import Header from "../widgets/Header/Header";
import Footer from "../widgets/Footer/Footer";

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-layout__content">
        <Header />

        <main className="app-layout__main">
          <Outlet />
        </main>

        <Footer/>
      </div>
    </div>
  );
}

export default AppLayout;
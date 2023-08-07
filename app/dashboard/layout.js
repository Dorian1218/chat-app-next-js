import React from "react";
import Sidebar from "../components/Sidebar";
import PusherContext from "../context/PusherContext";

export default function Layout({ children }) {
  return (
    <div className="flex">
      <div className="w-1/5">
        <Sidebar />
      </div>
      <div className="w-4/5">
        <PusherContext>{children}</PusherContext>
      </div>
    </div>
  );
}

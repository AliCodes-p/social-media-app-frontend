"use client";

import { useEffect, useState } from "react";
import {
  getIncomingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/lib/api";
import {
  FriendRequestResponse,
  IncomingFriendRequestResponse,
} from "@/lib/types";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState<IncomingFriendRequestResponse[]>([]);

  async function loadRequests() {
    try {
      const data = await getIncomingFriendRequests();
      setRequests(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleAccept(id: number) {
    await acceptFriendRequest(id);

    setRequests((prev) => prev.filter((request) => request.id !== id));
  }

  async function handleReject(id: number) {
    await rejectFriendRequest(id);

    setRequests((prev) => prev.filter((request) => request.id !== id));
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Header />

      <div className="w-full max-w-[1440px] mx-auto px-6 mt-6 md:mt-8 flex-1 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-8 items-start">
          {/* LEFT SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0" style={{ maxWidth: "700px" }}>
            <div className="max-w-3xl mx-auto">
              <div
                className="
                bg-white
                rounded-2xl
                border
                border-[#EAEAEF]
                p-6
                shadow-sm
              "
              >
                <h1
                  className="
                  text-2xl
                  font-bold
                  text-[#0F0F1A]
                "
                >
                  Friend Requests
                </h1>

                <p
                  className="
                  text-sm
                  text-[#9B9BB0]
                  mt-1
                  mb-6
                "
                >
                  Manage your pending friend requests
                </p>

                {requests.length === 0 ? (
                  <div
                    className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    py-16
                    text-center
                  "
                  >
                    <div
                      className="
                      w-16
                      h-16
                      rounded-full
                      bg-[#EEEFFE]
                      flex
                      items-center
                      justify-center
                      text-[#5B5CEB]
                      text-2xl
                    "
                    >
                      👥
                    </div>

                    <h2
                      className="
                      mt-4
                      font-semibold
                      text-[#0F0F1A]
                    "
                    >
                      No pending requests
                    </h2>

                    <p
                      className="
                      text-sm
                      text-[#9B9BB0]
                      mt-1
                    "
                    >
                      When someone sends you a request, it will appear here.
                    </p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className="
                      flex
                      items-center
                      justify-between
                      border
                      border-[#ECECF2]
                      rounded-xl
                      p-4
                      mb-3
                      hover:bg-[#FAFAFF]
                      transition
                    "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                          w-12
                          h-12
                          rounded-full
                          bg-gradient-to-br
                          from-[#5B5CEB]
                          to-[#7879F1]
                          text-white
                          flex
                          items-center
                          justify-center
                          font-bold
                        "
                        >
                          {request.sender_username.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p
                            className="
                            font-semibold
                            text-[#0F0F1A]
                          "
                          >
                            {request.sender_username}
                          </p>

                          <p
                            className="
                            text-sm
                            text-[#9B9BB0]
                          "
                          >
                            Sent you a friend request
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="
                          px-4
                          py-2
                          rounded-lg
                          bg-[#5B5CEB]
                          text-white
                          text-sm
                          font-medium
                        "
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleReject(request.id)}
                          className="
                          px-4
                          py-2
                          rounded-lg
                          border
                          text-sm
                          font-medium
                        "
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

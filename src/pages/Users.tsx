import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import Switch from "../components/Switch";
import toast from "react-hot-toast";

interface Props {
  logout: () => void;
}

interface Device {
  hwid: string;
  ip_address: string;
  last_seen: string;
}

interface Entitlement {
  id: number;
  event_url: string;
}

interface User {
  id: number;
  username: string;
  license_key: string;
  expires_at: string;
  active: boolean;
  max_devices: number;
  devices?: Device[];
  entitlements?: Entitlement[];
}

const ITEMS_PER_PAGE = 5;

export default function Users({ logout }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [daysValid, setDaysValid] = useState(30);
  const [maxDevices, setMaxDevices] = useState(1);

  // Entitlement modal state
  const [showEntModal, setShowEntModal] = useState(false);
  const [entUserId, setEntUserId] = useState<number | null>(null);
  const [entUsername, setEntUsername] = useState("");
  const [entUrl, setEntUrl] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ITEMS_PER_PAGE)
  );

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleUser = async (id: number) => {
    try {
      setLoadingId(id);
      await api.patch(`/admin/users/${id}/toggle`);
      await fetchUsers();
      toast.success("Status updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoadingId(null);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setLoadingId(id);
      await api.delete(`/admin/users/${id}`);
      await fetchUsers();
      toast.success("User deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoadingId(null);
    }
  };

  const revokeDevice = async (userId: number, hwid: string) => {
    try {
      await api.delete(`/admin/devices/${userId}/${hwid}`);
      toast.success("Device revoked");
      fetchUsers();
    } catch {
      toast.error("Failed to revoke device");
    }
  };

  const createUser = async () => {
    if (!username.trim()) return;

    try {
      await api.post("/admin/users", {
        username,
        days_valid: daysValid,
        max_devices: maxDevices,
      });

      toast.success("User created");
      setShowModal(false);
      setUsername("");
      setDaysValid(30);
      setMaxDevices(1);
      fetchUsers();
    } catch {
      toast.error("Creation failed");
    }
  };

  const copyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Copied");
  };

  // =============================================
  // ENTITLEMENT FUNCTIONS
  // =============================================

  const openEntitlementModal = (user: User) => {
    setEntUserId(user.id);
    setEntUsername(user.username);
    setEntUrl("");
    setShowEntModal(true);
  };

  const addEntitlement = async () => {
    if (!entUrl.trim() || !entUserId) return;

    try {
      await api.post(`/admin/users/${entUserId}/entitlements`, {
        event_url: entUrl.trim(),
      });
      toast.success("Event assigned");
      setEntUrl("");
      fetchUsers();
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Event already assigned");
      } else {
        toast.error("Failed to assign event");
      }
    }
  };

  const removeEntitlement = async (userId: number, entId: number) => {
    try {
      await api.delete(`/admin/users/${userId}/entitlements/${entId}`);
      toast.success("Event removed");
      fetchUsers();
    } catch {
      toast.error("Failed to remove event");
    }
  };

  const clearEntitlements = async (userId: number) => {
    try {
      await api.post(`/admin/users/${userId}/entitlements/clear`);
      toast.success("All events cleared — user now gets all events");
      fetchUsers();
    } catch {
      toast.error("Failed to clear events");
    }
  };

  return (
    <DashboardLayout logout={logout}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Users</h2>

            <div className="flex gap-3">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              />

              <button
                onClick={() => setShowModal(true)}
                className="bg-primary px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/30 hover:opacity-90 transition"
              >
                + Create
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            <table className="w-full text-center">
              <thead className="text-gray-400 border-b border-border">
                <tr>
                  <th className="py-3">Username</th>
                  <th>License Key</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Devices</th>
                  <th>Events</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-gray-800/40 transition align-top"
                  >
                    <td className="py-4">{user.username}</td>

                    <td className="font-mono text-sm">
                      <div className="flex justify-center items-center gap-2">
                        <span className="break-all">
                          {user.license_key}
                        </span>
                        <button
                          onClick={() => copyLicense(user.license_key)}
                          className="p-1 rounded hover:bg-gray-700 transition"
                        >
                          📋
                        </button>
                      </div>
                    </td>

                    <td>
                      {new Date(user.expires_at).toLocaleDateString()}
                    </td>

                    <td>
                      <div className="flex justify-center">
                        <Switch
                          checked={user.active}
                          onChange={() => toggleUser(user.id)}
                        />
                      </div>
                    </td>

                    <td className="text-left">
                      <div className="text-xs text-gray-400 mb-1">
                        Allowed: {user.max_devices}
                      </div>

                      {user.devices && user.devices.length > 0 ? (
                        user.devices.map((device, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-800 p-2 rounded text-xs mb-2"
                          >
                            <div>HWID: {device.hwid}</div>
                            <div>IP: {device.ip_address}</div>
                            <div>
                              Last:{" "}
                              {new Date(device.last_seen).toLocaleString()}
                            </div>

                            <button
                              onClick={() =>
                                revokeDevice(user.id, device.hwid)
                              }
                              className="text-red-400 mt-1 hover:text-red-300"
                            >
                              Revoke Device
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500">
                          No devices
                        </div>
                      )}
                    </td>

                    {/* ENTITLEMENTS COLUMN */}
                    <td className="text-left">
                      {user.entitlements && user.entitlements.length > 0 ? (
                        <>
                          {user.entitlements.map((ent) => (
                            <div
                              key={ent.id}
                              className="bg-indigo-900/30 border border-indigo-500/30 p-2 rounded text-xs mb-2 flex justify-between items-center gap-2"
                            >
                              <span className="break-all text-indigo-300">
                                {ent.event_url}
                              </span>
                              <button
                                onClick={() =>
                                  removeEntitlement(user.id, ent.id)
                                }
                                className="text-red-400 hover:text-red-300 shrink-0"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => openEntitlementModal(user)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
                          >
                            + Add Event
                          </button>
                        </>
                      ) : (
                        <div>
                          <div className="text-xs text-green-400 mb-1">
                            All Events
                          </div>
                          <button
                            onClick={() => openEntitlementModal(user)}
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            + Restrict
                          </button>
                        </div>
                      )}
                    </td>

                    <td>
                      <button
                        disabled={loadingId === user.id}
                        onClick={() => deleteUser(user.id)}
                        className="bg-danger/20 text-danger px-3 py-1 rounded-lg hover:bg-danger/30 transition disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>

              <div className="flex gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* CREATE USER MODAL */}
          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-xl w-96 border border-border shadow-2xl">
                <h3 className="text-lg font-semibold mb-5">
                  Create User
                </h3>

                <input
                  className="w-full mb-3 p-3 bg-gray-700 rounded-lg"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <input
                  type="number"
                  className="w-full mb-3 p-3 bg-gray-700 rounded-lg"
                  value={daysValid}
                  onChange={(e) =>
                    setDaysValid(Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  className="w-full mb-5 p-3 bg-gray-700 rounded-lg"
                  value={maxDevices}
                  onChange={(e) =>
                    setMaxDevices(Number(e.target.value))
                  }
                />

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={createUser}
                    className="bg-primary px-5 py-2 rounded-lg"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ENTITLEMENT MODAL */}
          {showEntModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-xl w-[480px] border border-border shadow-2xl">
                <h3 className="text-lg font-semibold mb-2">
                  Manage Events — {entUsername}
                </h3>
                <p className="text-xs text-gray-400 mb-5">
                  Assign event URLs this user can access. No events = access to all.
                </p>

                {/* Current entitlements */}
                {entUserId && (
                  <div className="mb-4 max-h-40 overflow-y-auto">
                    {users
                      .find((u) => u.id === entUserId)
                      ?.entitlements?.map((ent) => (
                        <div
                          key={ent.id}
                          className="bg-indigo-900/30 border border-indigo-500/30 p-2 rounded text-xs mb-2 flex justify-between items-center"
                        >
                          <span className="break-all text-indigo-300">
                            {ent.event_url}
                          </span>
                          <button
                            onClick={() =>
                              removeEntitlement(entUserId, ent.id)
                            }
                            className="text-red-400 hover:text-red-300 ml-2 shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      )) || (
                      <div className="text-xs text-gray-500">
                        No events assigned — user gets all events
                      </div>
                    )}
                  </div>
                )}

                {/* Add event URL input */}
                <div className="flex gap-2 mb-4">
                  <input
                    className="flex-1 p-3 bg-gray-700 rounded-lg text-sm"
                    placeholder="https://smtickets.com/events/view/17522"
                    value={entUrl}
                    onChange={(e) => setEntUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEntitlement()}
                  />
                  <button
                    onClick={addEntitlement}
                    className="bg-primary px-4 py-2 rounded-lg text-sm shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="flex justify-between">
                  {entUserId &&
                    (users.find((u) => u.id === entUserId)?.entitlements
                      ?.length ?? 0) > 0 && (
                      <button
                        onClick={() => {
                          if (entUserId) clearEntitlements(entUserId);
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear All (give access to all events)
                      </button>
                    )}

                  <button
                    onClick={() => setShowEntModal(false)}
                    className="text-gray-400 ml-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

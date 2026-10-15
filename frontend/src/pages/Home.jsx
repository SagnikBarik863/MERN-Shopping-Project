import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { changePassword, getErrorMessage, getMe } from "../services/api";

const Home = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState({ text: "", isError: false });
  const [pwLoading, setPwLoading] = useState(false);

  // Always ask the backend who is logged in instead of storing the user in the browser
  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => setError("Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pw.oldPassword || pw.newPassword.length < 6) {
      setPwMsg({ text: "Enter your old password and a new password of at least 6 characters.", isError: true });
      return;
    }
    setPwLoading(true);
    try {
      const res = await changePassword(pw);
      setPwMsg({ text: res.data.message, isError: false });
      setPw({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setPwMsg({ text: getErrorMessage(err, "Could not change password"), isError: true });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <p className="center-msg">Loading your profile...</p>;
  if (error) return <p className="center-msg error-text">{error}</p>;

  return (
    <div>
      <h1>Welcome, {customer.fullName} 👋</h1>
      <p className="muted">Happy shopping at ShopKart.</p>

      <div className="grid-2">
        <div className="panel">
          <h2>My Profile</h2>
          <p><strong>Name:</strong> {customer.fullName}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Member since:</strong> {new Date(customer.createdAt).toLocaleDateString("en-IN")}</p>

          <div className="card-actions">
            <Link to="/products" className="btn">Browse Products</Link>
            <Link to="/orders" className="btn btn-outline">My Orders</Link>
          </div>
        </div>

        <form className="panel" onSubmit={handleChangePassword}>
          <h2>Change Password</h2>
          {pwMsg.text && <p className={`alert ${pwMsg.isError ? "alert-error" : "alert-success"}`}>{pwMsg.text}</p>}

          <label>Old Password</label>
          <input type="password" value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} />

          <label>New Password</label>
          <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />

          <button className="btn" disabled={pwLoading}>{pwLoading ? "Saving..." : "Update Password"}</button>
        </form>
      </div>
    </div>
  );
};

export default Home;

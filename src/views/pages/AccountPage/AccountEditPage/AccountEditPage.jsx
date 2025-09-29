import styles from "..//AccountPage.module.css";
import ChangePasswordModal from "../ChangePassword/ChangePasswordModal";
import Header from "../../../components/homeItem/Header/Header";
import Footer from "../../../components/homeItem/Footer/Footer";
import { useAccountEditViewModel } from "../../../../viewmodels/AccountEditViewModel";
import { useState } from "react";
export default function AccountEditPage() {
    const { form, loading, saving, error, handleChange, handleSubmit, navigate } =
        useAccountEditViewModel();
    const [showChangePassword, setShowChangePassword] = useState(false);
    if (loading) return <p className={styles.loading}>Đang tải...</p>;

    return (
        <div className={styles.account}>
            <Header />
            <main className={styles["account__main"]}>
                <div className={styles["account__container"]}>
                    <h1 className={styles["account__title"]}>Cập nhật thông tin</h1>
                    {error && <p className={styles.error}>{error}</p>}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label>Tên tài khoản</label>
                            <input name="username" value={form.username} onChange={handleChange} />
                        </div>

                        <div className={styles.field}>
                            <label>Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} />
                        </div>

                        <div className={styles.field}>
                            <label>Họ và tên</label>
                            <input name="fullName" value={form.fullName} onChange={handleChange} />
                        </div>

                        <div className={styles.field}>
                            <label>Địa chỉ</label>
                            <input name="address" value={form.address} onChange={handleChange} />
                        </div>

                        <div className={styles.field}>
                            <label>Số điện thoại</label>
                            <input name="phone" value={form.phone} onChange={handleChange} />
                        </div>

                        <div className={styles.field}>
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Để trống nếu không đổi"
                            />
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => navigate("/account")}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={saving}
                            >
                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                            <button
                                type="button"
                                className={styles.submitBtn}
                                onClick={() => setShowChangePassword(true)}
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </div>
    );
}

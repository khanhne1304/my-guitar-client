import styles from "../AccountPage.module.css";
import ChangePasswordModal from "../ChangePassword/ChangePasswordModal";
import Header from "../../../components/homeItem/Header/Header";
import Footer from "../../../components/homeItem/Footer/Footer";
import { useAccountEditViewModel } from "../../../../viewmodels/AccountEditViewModel";
import { useState } from "react";
export default function AccountEditPage() {
    const { form, loading, saving, error, handleChange, handleAvatarFileChange, avatarPreview, handleSubmit, navigate, returnTo } =
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
                            {(avatarPreview || form.avatarUrl) ? (
                                <div className={styles.avatarEditPreviewWrap}>
                                    <img
                                        src={avatarPreview || form.avatarUrl}
                                        alt="Avatar preview"
                                        className={styles.avatarEditPreview}
                                    />
                                </div>
                            ) : null}
                            <label>Ảnh đại diện</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleAvatarFileChange(e.target.files?.[0] || null)}
                            />
                        </div>

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

                        <h2 className={styles["account__title"]} style={{ marginTop: 18, fontSize: 20 }}>
                            Thông tin trang cá nhân (Diễn đàn)
                        </h2>

                        <div className={styles.field}>
                            <label>Giới thiệu (Bio)</label>
                            <textarea
                                name="bio"
                                value={form.bio || ""}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Ví dụ: Yêu guitar, thích fingerstyle..."
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Nơi sống</label>
                            <input name="location" value={form.location || ""} onChange={handleChange} />
                        </div>

                        <div className={styles.field}>
                            <label>Ngày sinh</label>
                            <input name="birthday" value={form.birthday || ""} onChange={handleChange} placeholder="dd/mm/yyyy" />
                        </div>

                        <div className={styles.field}>
                            <label>Học vấn</label>
                            <input name="education" value={form.education || ""} onChange={handleChange} />
                        </div>

                        <div className={styles.field}>
                            <label>Website</label>
                            <input name="website" value={form.website || ""} onChange={handleChange} placeholder="https://..." />
                        </div>

                        <div className={styles.field}>
                            <label>Facebook</label>
                            <input name="facebookUrl" value={form.facebookUrl || ""} onChange={handleChange} placeholder="https://facebook.com/..." />
                        </div>

                        <div className={styles.field}>
                            <label>YouTube</label>
                            <input name="youtubeUrl" value={form.youtubeUrl || ""} onChange={handleChange} placeholder="https://youtube.com/@..." />
                        </div>

                        <div className={styles.field}>
                            <label>TikTok</label>
                            <input name="tiktokUrl" value={form.tiktokUrl || ""} onChange={handleChange} placeholder="https://tiktok.com/@..." />
                        </div>

                        <div className={styles.actions}>
                            {returnTo !== "/account" ? (
                                <>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => navigate(returnTo)}
                                    >
                                        Bỏ qua
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitBtn}
                                        disabled={saving}
                                    >
                                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
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

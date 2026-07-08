import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  publishAdminCourse,
} from "../../../../services/adminCourseApi";
import { useConfirm } from "../../../../context/ConfirmContext";
import styles from "./CourseManager.module.css";

const LEVELS = [
  { id: "beginner", label: "Cơ bản" },
  { id: "intermediate", label: "Trung cấp" },
  { id: "advanced", label: "Nâng cao" },
];

const emptyForm = {
  title: "",
  description: "",
  thumbnail: "",
  level: "beginner",
  tags: "",
  isPublished: false,
};

function levelLabel(level) {
  return LEVELS.find((l) => l.id === level)?.label || level;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function CourseManager() {
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      const data = await listAdminCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách khóa học");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [courses, search]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(course) {
    setEditId(course.id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      thumbnail: course.thumbnail || "",
      level: course.level || "beginner",
      tags: (course.tags || []).join(", "),
      isPublished: Boolean(course.isPublished),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        thumbnail: form.thumbnail.trim(),
        level: form.level,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editId) {
        await updateAdminCourse(editId, {
          ...payload,
          isPublished: form.isPublished,
        });
        closeModal();
        fetchData();
      } else {
        const res = await createAdminCourse(payload);
        const newId = res.course?.id || res.id;
        closeModal();
        if (newId) {
          navigate(`/creator/course/${newId}/edit`);
        } else {
          fetchData();
        }
      }
    } catch (err) {
      setError(err?.message || "Lưu khóa học thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    if (
      !(await confirm(
        `Xóa khóa học "${course.title}"? Toàn bộ module, bài học và tiến độ liên quan sẽ bị xóa.`,
      ))
    ) {
      return;
    }
    try {
      setError("");
      await deleteAdminCourse(course.id);
      fetchData();
    } catch (err) {
      setError(err?.message || "Xóa khóa học thất bại");
    }
  }

  async function handlePublish(course) {
    try {
      setError("");
      await publishAdminCourse(course.id);
      fetchData();
    } catch (err) {
      setError(err?.message || "Xuất bản khóa học thất bại");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý khóa học</h1>
        <button type="button" className={styles.addBtn} onClick={openCreate}>
          + Thêm khóa học
        </button>
      </div>

      <p className={styles.hint}>
        Thêm, sửa, xóa khóa học. Dùng &quot;Nội dung&quot; để quản lý module và bài học.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.searchRow}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Tìm theo tên, slug, tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : filteredCourses.length === 0 ? (
        <div className={styles.empty}>
          {search ? "Không tìm thấy khóa học phù hợp." : "Chưa có khóa học nào."}
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tiêu đề</th>
              <th>Cấp độ</th>
              <th>Trạng thái</th>
              <th>Module / Bài</th>
              <th>Người tạo</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td>
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className={styles.thumbnail}
                    />
                  ) : (
                    <div className={styles.noThumb}>N/A</div>
                  )}
                </td>
                <td>
                  <strong>{course.title}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{course.slug}</div>
                </td>
                <td className={styles.level}>{levelLabel(course.level)}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      course.isPublished ? styles.published : styles.draft
                    }`}
                  >
                    {course.isPublished ? "Đã xuất bản" : "Nháp"}
                  </span>
                </td>
                <td>
                  {course.moduleCount ?? 0} / {course.lessonCount ?? 0}
                </td>
                <td>{course.creator?.fullName || course.creator?.username || "—"}</td>
                <td>{formatDate(course.updatedAt)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => openEdit(course)}
                    >
                      Sửa
                    </button>
                    <Link
                      to={`/creator/course/${course.id}/edit`}
                      className={styles.contentBtn}
                    >
                      Nội dung
                    </Link>
                    {!course.isPublished && (
                      <button
                        type="button"
                        className={styles.publishBtn}
                        onClick={() => handlePublish(course)}
                      >
                        Xuất bản
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(course)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? "Sửa khóa học" : "Thêm khóa học"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>
                Tiêu đề *
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, title: e.target.value }))
                  }
                  placeholder="Ví dụ: Guitar cơ bản cho người mới"
                />
              </label>
              <label>
                Mô tả
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="Mô tả ngắn về khóa học"
                />
              </label>
              <label>
                Ảnh bìa (URL)
                <input
                  type="url"
                  value={form.thumbnail}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, thumbnail: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>
              <label>
                Cấp độ
                <select
                  value={form.level}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, level: e.target.value }))
                  }
                >
                  {LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tags (phân cách bằng dấu phẩy)
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, tags: e.target.value }))
                  }
                  placeholder="guitar, cơ bản, acoustic"
                />
              </label>
              {editId && (
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, isPublished: e.target.checked }))
                    }
                  />
                  Đã xuất bản (hiển thị công khai)
                </label>
              )}
              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} disabled={saving}>
                  Huỷ
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

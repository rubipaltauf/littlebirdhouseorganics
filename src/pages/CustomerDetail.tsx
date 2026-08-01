import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createCustomerNote,
  createCustomerTag,
  deleteCustomerNote,
  deleteCustomerTag,
  getCustomer,
  getCustomerNotes,
  getCustomerTagRows,
  updateCustomer,
  updateCustomerNote,
  updateCustomerTag,
} from "../lib/crm";
import { getSession, hasAdminRole } from "../lib/auth";
import type { Customer } from "../types";

type NoteRow = {
  id: string;
  note: string;
};

type TagRow = {
  id: string;
  tag: string;
};

export default function CustomerDetail() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthday: "",
    status: "Prospect",
    lastContact: "",
    marketingConsent: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCustomer() {
      if (!customerId) {
        setCustomer(null);
        setTags([]);
        setNotes([]);
        setIsLoading(false);
        return;
      }

      try {
        const session = await getSession();
        const user = session?.user;
        if (user) {
          setIsAdmin(await hasAdminRole(user.id));
        }

        const [nextCustomer, nextTags, nextNotes] = await Promise.all([
          getCustomer(customerId),
          getCustomerTagRows(customerId),
          getCustomerNotes(customerId),
        ]);

        setCustomer(nextCustomer);
        setTags(nextTags);
        setNotes(nextNotes);
        setProfileDraft({
          fullName: nextCustomer?.name ?? "",
          email: nextCustomer?.email ?? "",
          phone: nextCustomer?.phone ?? "",
          birthday: nextCustomer?.birthday ?? "",
          status: nextCustomer?.status ?? "Prospect",
          lastContact: nextCustomer?.lastContact ?? "",
          marketingConsent: nextCustomer?.consent === "Marketing opted in",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load customer record.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCustomer();
  }, [customerId]);

  async function reloadCustomerData() {
    if (!customerId) {
      return;
    }

    const [nextTags, nextNotes] = await Promise.all([
      getCustomerTagRows(customerId),
      getCustomerNotes(customerId),
    ]);

    setTags(nextTags);
    setNotes(nextNotes);
  }

  async function handleAddTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !tagDraft.trim()) {
      return;
    }

    setSaving(true);
    try {
      await createCustomerTag(customerId, tagDraft.trim());
      setTagDraft("");
      await reloadCustomerData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add tag.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !noteDraft.trim()) {
      return;
    }

    setSaving(true);
    try {
      await createCustomerNote(customerId, noteDraft.trim());
      setNoteDraft("");
      await reloadCustomerData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTag(tagId: string) {
    setSaving(true);
    try {
      await deleteCustomerTag(tagId);
      await reloadCustomerData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete tag.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    setSaving(true);
    try {
      await deleteCustomerNote(noteId);
      await reloadCustomerData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTag(tagId: string) {
    const tag = tags.find((entry) => entry.id === tagId);
    if (!tag || !tag.tag.trim()) {
      return;
    }

    setSaving(true);
    try {
      await updateCustomerTag(tagId, tag.tag.trim());
      setEditingTagId(null);
      await reloadCustomerData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update tag.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote(noteId: string) {
    const note = notes.find((entry) => entry.id === noteId);
    if (!note || !note.note.trim()) {
      return;
    }

    setSaving(true);
    try {
      await updateCustomerNote(noteId, note.note.trim());
      setEditingNoteId(null);
      await reloadCustomerData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) {
      return;
    }

    setSaving(true);
    try {
      await updateCustomer(customerId, {
        full_name: profileDraft.fullName.trim(),
        email: profileDraft.email.trim(),
        phone: profileDraft.phone.trim() || null,
        birthday: profileDraft.birthday || null,
        customer_status: profileDraft.status,
        last_contact: profileDraft.lastContact.trim() || null,
        marketing_consent: profileDraft.marketingConsent,
      });

      const nextCustomer = await getCustomer(customerId);
      setCustomer(nextCustomer);
      setProfileDraft({
        fullName: nextCustomer?.name ?? "",
        email: nextCustomer?.email ?? "",
        phone: nextCustomer?.phone ?? "",
        birthday: nextCustomer?.birthday ?? "",
        status: nextCustomer?.status ?? "Prospect",
        lastContact: nextCustomer?.lastContact ?? "",
        marketingConsent: nextCustomer?.consent === "Marketing opted in",
      });
      setEditingProfile(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update customer.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="panel stack">
        <h1>Loading customer</h1>
        <p className="muted">Fetching the requested profile…</p>
      </section>
    );
  }

  if (!customer) {
    return (
      <section className="panel stack">
        <h1>Customer not found</h1>
        <p className="muted">
          The requested customer record does not exist in the current dataset.
        </p>
        {error ? <p className="muted">{error}</p> : null}
        <Link to="/admin/dashboard">Back to dashboard</Link>
      </section>
    );
  }

  return (
    <section className="panel stack">
      <div>
        <h1>{customer.name}</h1>
        <p className="muted">{customer.id}</p>
      </div>

      <div className="grid">
        <div className="panel">
          <strong>Contact</strong>
          {editingProfile ? (
            <form className="form" onSubmit={handleSaveProfile}>
              <div className="field">
                <label htmlFor="profile-name">Full name</label>
                <input
                  id="profile-name"
                  value={profileDraft.fullName}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, fullName: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileDraft.email}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-phone">Phone</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={profileDraft.phone}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-birthday">Birthday</label>
                <input
                  id="profile-birthday"
                  type="date"
                  value={profileDraft.birthday}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, birthday: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-status">Status</label>
                <select
                  id="profile-status"
                  value={profileDraft.status}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="Prospect">Prospect</option>
                  <option value="Active">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="profile-last-contact">Last contact</label>
                <input
                  id="profile-last-contact"
                  value={profileDraft.lastContact}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, lastContact: event.target.value }))}
                />
              </div>
              <label className="field">
                <input
                  type="checkbox"
                  checked={profileDraft.marketingConsent}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, marketingConsent: event.target.checked }))}
                />
                Marketing consent
              </label>
              <div className="action-row">
                <button className="button primary" type="submit" disabled={saving}>
                  Save changes
                </button>
                <button className="button secondary" type="button" onClick={() => setEditingProfile(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="copy">{customer.email}</p>
              <p className="copy">{customer.phone}</p>
            </>
          )}
        </div>
        <div className="panel">
          <strong>Birthday</strong>
          {editingProfile ? (
            <p className="copy">{profileDraft.birthday || "No birthday yet"}</p>
          ) : (
            <p className="copy">{customer.birthday}</p>
          )}
        </div>
        <div className="panel">
          <strong>Marketing status</strong>
          {editingProfile ? (
            <p className="copy">{profileDraft.marketingConsent ? "Marketing opted in" : "Marketing not yet confirmed"}</p>
          ) : (
            <p className="copy">{customer.consent}</p>
          )}
        </div>
      </div>

      {isAdmin ? (
        <>
          <div className="panel stack">
            <div className="action-row">
              <strong>Customer profile</strong>
              {!editingProfile ? (
                <button className="text-button" type="button" onClick={() => setEditingProfile(true)}>
                  Edit profile
                </button>
              ) : null}
            </div>
            <p className="copy">Update the customer’s profile fields from the CRM.</p>
            {!editingProfile ? (
              <>
                <p className="copy">
                  <strong>Status:</strong> {customer.status}
                </p>
                <p className="copy">
                  <strong>Last contact:</strong> {customer.lastContact || "No last contact yet"}
                </p>
              </>
            ) : null}
          </div>

          <div className="panel stack">
            <strong>Tags</strong>
            <form className="form-inline" onSubmit={handleAddTag}>
              <input
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                placeholder="Add a tag"
              />
              <button className="button primary" type="submit" disabled={saving}>
                Add tag
              </button>
            </form>
            {tags.length > 0 ? (
              <ul className="tag-list">
                {tags.map((tag) => (
                  <li className="tag-pill" key={tag.id}>
                    {editingTagId === tag.id ? (
                      <div className="inline-edit">
                        <input
                          value={tag.tag}
                          onChange={(event) =>
                            setTags((current) =>
                              current.map((entry) =>
                                entry.id === tag.id ? { ...entry, tag: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                        <button className="button secondary" type="button" onClick={() => handleSaveTag(tag.id)}>
                          Save
                        </button>
                        <button className="button secondary" type="button" onClick={() => setEditingTagId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="tag-actions">
                        <span>{tag.tag}</span>
                        <div className="action-row">
                          <button className="text-button" type="button" onClick={() => setEditingTagId(tag.id)}>
                            Edit
                          </button>
                          <button className="text-button" type="button" onClick={() => handleDeleteTag(tag.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="copy">No tags yet.</p>
            )}
          </div>

          <div className="panel stack">
            <strong>Follow-up notes</strong>
            <form className="form-inline" onSubmit={handleAddNote}>
              <input
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Add a note"
              />
              <button className="button primary" type="submit" disabled={saving}>
                Add note
              </button>
            </form>
            {notes.length > 0 ? (
              <ul className="note-list">
                {notes.map((note) => (
                  <li key={note.id}>
                    {editingNoteId === note.id ? (
                      <div className="inline-edit">
                        <input
                          value={note.note}
                          onChange={(event) =>
                            setNotes((current) =>
                              current.map((entry) =>
                                entry.id === note.id ? { ...entry, note: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                        <button className="button secondary" type="button" onClick={() => handleSaveNote(note.id)}>
                          Save
                        </button>
                        <button className="button secondary" type="button" onClick={() => setEditingNoteId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="note-actions">
                        <div>{note.note}</div>
                        <div className="action-row">
                          <button className="text-button" type="button" onClick={() => setEditingNoteId(note.id)}>
                            Edit
                          </button>
                          <button className="text-button" type="button" onClick={() => handleDeleteNote(note.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="copy">No follow-up notes yet.</p>
            )}
          </div>
        </>
      ) : (
        <div className="panel stack">
          <strong>CRM notes and tags</strong>
          <p className="copy">Admin access is required to manage customer notes and tags.</p>
        </div>
      )}
    </section>
  );
}


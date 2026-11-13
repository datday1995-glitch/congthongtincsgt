import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eye,
  FileUp,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pencil,
  Quote,
  Redo2,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { uploadMediaFile } from '../../services/portalService';
import type { AdminSession } from '../../types/portal';
import { sanitizeRichHtml } from '../../utils/formatters';
import { useToast } from '../ui/Feedback';

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: 'width: 100%; height: auto;',
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  session: AdminSession;
}

export function RichTextEditor({ value, onChange, session }: RichTextEditorProps) {
  const { showToast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [imageUrlModalOpen, setImageUrlModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [selectedCaptionOpen, setSelectedCaptionOpen] = useState(false);
  const [selectedCaptionText, setSelectedCaptionText] = useState('');

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CustomImage.configure({
        allowBase64: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder:
          'Soạn thảo nội dung hướng dẫn chi tiết, các bước thực hiện, thành phần hồ sơ, thời gian giải quyết... (Có thể kéo thả nhiều ảnh trực tiếp vào đây)',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = Array.from(event.dataTransfer.files).filter((f) =>
            f.type.startsWith('image/')
          );
          if (files.length > 0) {
            event.preventDefault();
            void handleUploadMultipleImages(files);
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const handleUploadMultipleImages = async (files: File[]) => {
    if (!editor || files.length === 0) return;
    setUploadingImage(true);
    try {
      for (const file of files) {
        const asset = await uploadMediaFile(session, file, 'image');
        editor
          .chain()
          .focus()
          .setImage({
            src: asset.url,
            alt: file.name.replace(/\.[^.]+$/, ''),
            title: file.name.replace(/\.[^.]+$/, ''),
          })
          .createParagraphNear()
          .run();
      }
      showToast(
        'success',
        `Đã chèn ${files.length} hình ảnh`,
        'Nhấp vào ảnh trong bài để điều chỉnh kích thước hoặc thêm chú thích.'
      );
    } catch (err) {
      showToast(
        'error',
        'Tải ảnh lên thất bại',
        err instanceof Error ? err.message : 'Vui lòng thử lại hoặc dán URL ảnh.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInsertDocumentLink = async (file: File) => {
    if (!editor) return;
    setUploadingDoc(true);
    try {
      const asset = await uploadMediaFile(session, file, 'document');
      editor
        .chain()
        .focus()
        .insertContent(
          `<p><a href="${asset.url}" target="_blank" rel="noopener noreferrer">Tải tài liệu: ${asset.name}</a></p>`
        )
        .run();
      showToast('success', 'Đã chèn liên kết tài liệu', asset.name);
    } catch (err) {
      showToast(
        'error',
        'Tải tài liệu thất bại',
        err instanceof Error ? err.message : 'Không thể tải tài liệu lên Storage.'
      );
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleApplyLink = () => {
    if (!editor) return;
    if (!linkUrlInput.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrlInput.trim() }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrlInput('');
  };

  const handleInsertImageByUrl = () => {
    if (!editor || !imageUrlInput.trim()) return;
    const caption = imageCaptionInput.trim();
    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrlInput.trim(),
        alt: caption || 'Hình ảnh minh họa',
        title: caption || undefined,
      })
      .run();
    if (caption) {
      editor.chain().focus().insertContent(`<p><em>${caption}</em></p>`).run();
    }
    setImageUrlModalOpen(false);
    setImageUrlInput('');
    setImageCaptionInput('');
  };

  const setSelectedImageWidth = (widthPercent: string) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .updateAttributes('image', { style: `width: ${widthPercent}; height: auto;` })
      .run();
  };

  const openSelectedImageCaption = () => {
    if (!editor) return;
    const currentAttrs = editor.getAttributes('image');
    setSelectedCaptionText(currentAttrs.title || currentAttrs.alt || '');
    setSelectedCaptionOpen((prev) => !prev);
  };

  const applySelectedImageCaption = () => {
    if (!editor) return;
    const caption = selectedCaptionText.trim();
    editor.chain().focus().updateAttributes('image', { title: caption, alt: caption }).run();
    if (caption) {
      editor.chain().focus().createParagraphNear().insertContent(`<em>${caption}</em>`).run();
    }
    setSelectedCaptionOpen(false);
    setSelectedCaptionText('');
  };

  if (!editor) return null;

  const isImageActive = editor.isActive('image');
  const isTableActive = editor.isActive('table');

  const btnClass = (active = false) =>
    `inline-flex items-center justify-center rounded-md p-1.5 text-xs font-medium transition-colors cursor-pointer ${
      active
        ? 'bg-[#0B1F3A] text-white'
        : 'text-slate-700 hover:bg-slate-200/80'
    }`;

  return (
    <div className="rounded-xl border border-slate-300 bg-white overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <button
          type="button"
          title="Hoàn tác"
          onClick={() => editor.chain().focus().undo().run()}
          className={btnClass(false)}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Làm lại"
          onClick={() => editor.chain().focus().redo().run()}
          className={btnClass(false)}
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          title="Tiêu đề H1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={btnClass(editor.isActive('heading', { level: 1 }))}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Tiêu đề H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnClass(editor.isActive('heading', { level: 2 }))}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Tiêu đề H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnClass(editor.isActive('heading', { level: 3 }))}
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          title="In đậm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="In nghiêng"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Gạch chân"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive('underline'))}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          title="Căn trái"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={btnClass(editor.isActive({ textAlign: 'left' }))}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Căn giữa"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={btnClass(editor.isActive({ textAlign: 'center' }))}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Căn phải"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={btnClass(editor.isActive({ textAlign: 'right' }))}
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          title="Danh sách gạch đầu dòng"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Danh sách đánh số"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Trích dẫn / Lưu ý"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive('blockquote'))}
        >
          <Quote className="h-4 w-4" />
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          title="Chèn bảng biểu 3x3"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          className={btnClass(isTableActive)}
        >
          <TableIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Chèn liên kết"
          onClick={() => {
            const currentHref = editor.getAttributes('link').href || '';
            setLinkUrlInput(currentHref);
            setLinkDialogOpen((prev) => !prev);
          }}
          className={btnClass(editor.isActive('link'))}
        >
          <Link2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={uploadingImage}
          title="Tải lên nhiều hình ảnh minh họa"
          onClick={() => imageInputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" />
          <span>{uploadingImage ? 'Đang tải...' : 'Tải ảnh'}</span>
        </button>

        <button
          type="button"
          title="Chèn ảnh từ đường dẫn URL"
          onClick={() => setImageUrlModalOpen((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
        >
          <span>URL ảnh</span>
        </button>

        <button
          type="button"
          disabled={uploadingDoc}
          title="Chèn liên kết tải tài liệu vào bài"
          onClick={() => docInputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer disabled:opacity-50"
        >
          <FileUp className="h-4 w-4" />
          <span>{uploadingDoc ? 'Đang tải...' : 'Chèn tệp'}</span>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreviewMode((p) => !p)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              previewMode
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {previewMode ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{previewMode ? 'Tiếp tục soạn' : 'Xem trước'}</span>
          </button>
        </div>
      </div>

      {/* Contextual Image Controls when an image is selected */}
      {isImageActive && !previewMode && (
        <div className="flex flex-wrap items-center gap-2 border-b border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs">
          <span className="font-semibold text-[#0B1F3A]">Kích thước ảnh:</span>
          {['25%', '50%', '75%', '100%'].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedImageWidth(size)}
              className="rounded border border-blue-200 bg-white px-2 py-0.5 font-mono text-slate-800 hover:bg-blue-100 cursor-pointer"
            >
              {size}
            </button>
          ))}
          <button
            type="button"
            onClick={openSelectedImageCaption}
            className="ml-2 rounded border border-blue-300 bg-white px-2.5 py-0.5 font-medium text-blue-800 hover:bg-blue-100 cursor-pointer"
          >
            Thêm chú thích ảnh
          </button>
          {selectedCaptionOpen && (
            <div className="w-full flex items-center gap-2 pt-1.5">
              <input
                type="text"
                value={selectedCaptionText}
                onChange={(e) => setSelectedCaptionText(e.target.value)}
                placeholder="Nhập chú thích hiển thị bên dưới ảnh..."
                className="flex-1 rounded border border-blue-300 bg-white px-2.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={applySelectedImageCaption}
                className="rounded bg-[#0B1F3A] px-2.5 py-1 text-xs font-semibold text-white cursor-pointer"
              >
                Chèn chú thích
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contextual Table Controls when inside a table */}
      {isTableActive && !previewMode && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-1.5 text-xs">
          <span className="font-semibold text-slate-700 mr-1">Bảng biểu:</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 hover:bg-slate-50 cursor-pointer"
          >
            + Cột
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 hover:bg-slate-50 cursor-pointer"
          >
            - Cột
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 hover:bg-slate-50 cursor-pointer"
          >
            + Hàng
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 hover:bg-slate-50 cursor-pointer"
          >
            - Hàng
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-0.5 text-red-700 hover:bg-red-50 cursor-pointer ml-auto"
          >
            <Trash2 className="h-3 w-3" />
            <span>Xóa bảng</span>
          </button>
        </div>
      )}

      {/* Inline Link Dialog */}
      {linkDialogOpen && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <input
            type="url"
            value={linkUrlInput}
            onChange={(e) => setLinkUrlInput(e.target.value)}
            placeholder="https://dichvucong.gov.vn/..."
            className="flex-1 min-w-[200px] rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600"
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="rounded bg-[#0B1F3A] px-3 py-1.5 font-semibold text-white hover:bg-blue-800 cursor-pointer"
          >
            Áp dụng liên kết
          </button>
          <button
            type="button"
            onClick={() => setLinkDialogOpen(false)}
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Inline Image URL Modal */}
      {imageUrlModalOpen && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Dán đường dẫn URL hình ảnh (https://...)"
            className="flex-1 min-w-[200px] rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600"
          />
          <input
            type="text"
            value={imageCaptionInput}
            onChange={(e) => setImageCaptionInput(e.target.value)}
            placeholder="Chú thích ảnh (tùy chọn)"
            className="w-52 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600"
          />
          <button
            type="button"
            onClick={handleInsertImageByUrl}
            className="rounded bg-[#0B1F3A] px-3 py-1.5 font-semibold text-white hover:bg-blue-800 cursor-pointer"
          >
            Chèn ảnh
          </button>
          <button
            type="button"
            onClick={() => setImageUrlModalOpen(false)}
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length > 0) void handleUploadMultipleImages(files);
          e.target.value = '';
        }}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleInsertDocumentLink(file);
          e.target.value = '';
        }}
      />

      {/* Editor Body or Live Preview */}
      {previewMode ? (
        <div
          className="portal-prose p-6 min-h-[380px] bg-white"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
        />
      ) : (
        <EditorContent
          editor={editor}
          className="portal-prose p-5 sm:p-6 min-h-[380px] bg-white cursor-text"
        />
      )}
    </div>
  );
}

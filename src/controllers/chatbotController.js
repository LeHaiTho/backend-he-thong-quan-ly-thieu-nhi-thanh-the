const { systemName } = require('../utils/constants');
const db = require('../config/db');

// Groq tools configuration schema
const chatTools = [
  {
    type: "function",
    function: {
      name: "getSystemStats",
      description: "Lấy thống kê tổng quan của xứ đoàn: niên học hiện tại, số lượng phân đoàn (khối), tổng số lớp, tổng số học viên và giáo lý viên.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "getBlocksAndClasses",
      description: "Lấy danh sách phân đoàn (khối) và các lớp giáo lý theo niên học hiện tại. Có thể lọc theo tên phân đoàn.",
      parameters: {
        type: "object",
        properties: {
          blockName: { type: "string", description: "Tên phân đoàn cần lọc, ví dụ: 'Thiếu Nhi', 'Chiên Con'" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchStudentByName",
      description: "Tìm kiếm học viên dựa trên tên (bao gồm Tên Thánh, Họ và Tên gọi) hoặc Mã học viên để lấy ID.",
      parameters: {
        type: "object",
        properties: {
          fullName: { type: "string", description: "Họ và tên hoặc tên gọi của học viên, ví dụ: 'Lê Minh A' hoặc 'Minh A'" },
          saintName: { type: "string", description: "Tên thánh của học viên nếu có, ví dụ: 'Giuse', 'Maria'" }
        },
        required: ["fullName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getStudentProfile",
      description: "Lấy thông tin hồ sơ học viên (thông tin cá nhân, phụ huynh cơ bản, lớp hiện tại nếu có) bằng studentId hoặc Mã học viên.",
      parameters: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "ID duy nhất (UUID) hoặc Mã học viên (ví dụ: MHV-20260520-0002)" }
        },
        required: ["studentId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getStudentDetailsAndGrades",
      description: "Lấy thông tin chi tiết về lớp học, phân đoàn và bảng điểm các kỳ của một học viên cụ thể bằng studentId.",
      parameters: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "ID duy nhất (UUID) hoặc Mã học viên (ví dụ: MHV-20260520-0002)" }
        },
        required: ["studentId"]
      }
    }
  }
];

// Secure Tool Functions matching the schemas above
async function getSystemStats() {
  try {
    const [years] = await db.query("SELECT id, name FROM academic_years WHERE is_current = 1 AND deleted_at IS NULL LIMIT 1");
    const currentYearId = years[0]?.id;

    const [blocks] = currentYearId
      ? await db.query("SELECT COUNT(*) as count FROM blocks WHERE academic_year_id = ? AND deleted_at IS NULL", [currentYearId])
      : await db.query("SELECT COUNT(*) as count FROM blocks WHERE deleted_at IS NULL");
    const [classes] = currentYearId
      ? await db.query("SELECT COUNT(*) as count FROM classes WHERE academic_year_id = ? AND deleted_at IS NULL", [currentYearId])
      : await db.query("SELECT COUNT(*) as count FROM classes WHERE deleted_at IS NULL");
    const [students] = currentYearId
      ? await db.query(`
        SELECT COUNT(DISTINCT se.student_id) as count
        FROM student_enrollments se
        JOIN students s ON se.student_id = s.id AND s.deleted_at IS NULL
        WHERE se.academic_year_id = ? AND se.deleted_at IS NULL
      `, [currentYearId])
      : await db.query("SELECT COUNT(*) as count FROM students WHERE deleted_at IS NULL");
    const [teachers] = await db.query("SELECT COUNT(*) as count FROM teachers WHERE deleted_at IS NULL AND status = 'active'");
    
    return {
      totalBlocks: blocks[0]?.count || 0,
      totalClasses: classes[0]?.count || 0,
      totalStudents: students[0]?.count || 0,
      totalTeachers: teachers[0]?.count || 0,
      currentAcademicYear: years[0]?.name || "Chưa cập nhật"
    };
  } catch (error) {
    console.error("Lỗi getSystemStats:", error);
    return { error: "Không thể kết nối đến cơ sở dữ liệu." };
  }
}

async function getBlocksAndClasses({ blockName } = {}) {
  try {
    const [years] = await db.query("SELECT id, name FROM academic_years WHERE is_current = 1 AND deleted_at IS NULL LIMIT 1");
    const currentYearId = years[0]?.id;
    const currentYearName = years[0]?.name || "Chưa cập nhật";

    if (!currentYearId) {
      return { error: "Chưa xác định được niên học hiện tại." };
    }

    const params = [currentYearId];
    let blockFilterSql = "";
    if (blockName) {
      blockFilterSql = " AND b.name LIKE ? ";
      params.push(`%${blockName}%`);
    }

    const [blocks] = await db.query(`
      SELECT b.id, b.code, b.name, b.display_order,
             COUNT(c.id) as class_count
      FROM blocks b
      LEFT JOIN classes c ON c.block_id = b.id AND c.academic_year_id = b.academic_year_id AND c.deleted_at IS NULL
      WHERE b.academic_year_id = ? AND b.deleted_at IS NULL ${blockFilterSql}
      GROUP BY b.id, b.code, b.name, b.display_order
      ORDER BY b.display_order ASC, b.name ASC
    `, params);

    const [classes] = await db.query(`
      SELECT c.id, c.name, c.room, c.block_id
      FROM classes c
      WHERE c.academic_year_id = ? AND c.deleted_at IS NULL
      ORDER BY c.name ASC
    `, [currentYearId]);

    const classMap = new Map();
    classes.forEach((c) => {
      if (!classMap.has(c.block_id)) classMap.set(c.block_id, []);
      classMap.get(c.block_id).push({ id: c.id, name: c.name, room: c.room });
    });

    return {
      currentAcademicYear: currentYearName,
      blocks: blocks.map((b) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        classCount: b.class_count || 0,
        classes: classMap.get(b.id) || []
      }))
    };
  } catch (error) {
    console.error("Lỗi getBlocksAndClasses:", error);
    return { error: "Không thể kết nối đến cơ sở dữ liệu." };
  }
}

async function searchStudentByName({ fullName, saintName }) {
  try {
    const code = extractStudentCode(fullName);
    const cleanedName = fullName ? fullName.replace(code || "", "").trim() : "";
    const namePattern = cleanedName ? `%${cleanedName}%` : null;
    let sql = `
      SELECT id, code, saint_name, first_name, last_name, dob, status 
      FROM students 
      WHERE deleted_at IS NULL
    `;
    const params = [];
    const clauses = [];
    if (namePattern) {
      clauses.push(`
        CONCAT(first_name, ' ', last_name) LIKE ? 
        OR CONCAT(last_name, ' ', first_name) LIKE ?
        OR first_name LIKE ?
        OR last_name LIKE ?
      `);
      params.push(namePattern, namePattern, namePattern, namePattern);
    }
    if (code) {
      clauses.push("code = ?");
      params.push(code);
    }
    if (clauses.length === 0) {
      return [];
    }
    sql += ` AND (${clauses.join(" OR ")})`;
    
    if (saintName) {
      sql += " AND saint_name LIKE ?";
      params.push(`%${saintName}%`);
    }
    
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Lỗi searchStudentByName:", error);
    return [];
  }
}

async function getStudentProfile({ studentId }) {
  try {
    const resolvedStudentId = await resolveStudentId(studentId);
    if (!resolvedStudentId) {
      return { error: "Không tìm thấy học viên trong hệ thống." };
    }

    const [rows] = await db.query(`
      SELECT s.id, s.code, s.saint_name, s.first_name, s.last_name, s.gender, s.dob, s.pob,
             s.phone, s.address, s.father_name, s.father_saint_name, s.mother_name, s.mother_saint_name,
             s.status,
             c.name as class_name, b.name as block_name, y.name as year_name
      FROM students s
      LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.deleted_at IS NULL
      LEFT JOIN academic_years y ON se.academic_year_id = y.id AND y.is_current = 1 AND y.deleted_at IS NULL
      LEFT JOIN classes c ON se.class_id = c.id
      LEFT JOIN blocks b ON c.block_id = b.id
      WHERE s.id = ? AND s.deleted_at IS NULL
      ORDER BY y.is_current DESC, se.created_at DESC
      LIMIT 1
    `, [resolvedStudentId]);

    if (rows.length === 0) {
      return { error: "Không tìm thấy học viên trong hệ thống." };
    }

    return rows[0];
  } catch (error) {
    console.error("Lỗi getStudentProfile:", error);
    return { error: "Lỗi kết nối cơ sở dữ liệu khi truy vấn hồ sơ học viên." };
  }
}

async function getStudentDetailsAndGrades({ studentId }) {
  try {
    const resolvedStudentId = await resolveStudentId(studentId);
    if (!resolvedStudentId) {
      return { error: "Không tìm thấy học viên trong hệ thống." };
    }

    // Current class & block enrollment
    const [enrollment] = await db.query(`
      SELECT c.name as class_name, b.name as block_name, y.name as year_name, y.id as year_id, y.is_current
      FROM student_enrollments se
      JOIN classes c ON se.class_id = c.id
      JOIN blocks b ON c.block_id = b.id
      JOIN academic_years y ON se.academic_year_id = y.id
      WHERE se.student_id = ? AND y.is_current = 1 AND se.deleted_at IS NULL
      ORDER BY se.created_at DESC
      LIMIT 1
    `, [resolvedStudentId]);

    let activeEnrollment = enrollment[0];
    let isCurrentYear = true;
    if (!activeEnrollment) {
      const [latestEnrollment] = await db.query(`
        SELECT c.name as class_name, b.name as block_name, y.name as year_name, y.id as year_id, y.is_current
        FROM student_enrollments se
        JOIN classes c ON se.class_id = c.id
      JOIN blocks b ON c.block_id = b.id
      JOIN academic_years y ON se.academic_year_id = y.id
      WHERE se.student_id = ? AND se.deleted_at IS NULL
      ORDER BY y.is_current DESC, y.created_at DESC, se.created_at DESC
      LIMIT 1
      `, [resolvedStudentId]);
      activeEnrollment = latestEnrollment[0];
      isCurrentYear = Boolean(activeEnrollment?.is_current);
    }

    if (!activeEnrollment) {
      return { error: "Học viên chưa được xếp vào lớp nào trong hệ thống." };
    }

    // Detailed scores
    const [scores] = await db.query(`
      SELECT s.score_value, s.score_category, s.score_order, s.note, st.name as score_type_name, sem.name as semester_name, sem.semester_number
      FROM scores s
      JOIN score_types st ON s.score_type_id = st.id
      JOIN semesters sem ON s.semester_id = sem.id
      WHERE s.student_id = ? AND s.deleted_at IS NULL AND sem.academic_year_id = ?
      ORDER BY sem.semester_number, st.display_position, s.score_order
    `, [resolvedStudentId, activeEnrollment.year_id]);

    return {
      studentInfo: activeEnrollment,
      isCurrentYear,
      grades: scores
    };
  } catch (error) {
    console.error("Lỗi getStudentDetailsAndGrades:", error);
    return { error: "Lỗi kết nối cơ sở dữ liệu khi truy vấn bảng điểm." };
  }
}

function normalizeText(input) {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractStudentCode(message) {
  if (!message) return null;
  const explicit = message.match(/ma\s*hoc\s*v(i|ie)n\s*[:\-]?\s*([a-zA-Z0-9_-]+)/i);
  if (explicit?.[2]) return explicit[2].trim();
  const loose = message.match(/\b([A-Za-z]{1,6}-\d{2,}(?:-\d{2,})*|[A-Za-z]{1,3}\d{3,}|\d{4,})\b/);
  return loose?.[1] || null;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || "");
}

async function resolveStudentId(input) {
  if (!input) return null;
  if (isUuid(input)) return input;
  const code = extractStudentCode(input);
  if (code) {
    const [rows] = await db.query(
      "SELECT id FROM students WHERE code = ? AND deleted_at IS NULL LIMIT 1",
      [code]
    );
    if (rows[0]?.id) return rows[0].id;
  }
  const candidates = await searchStudentByName({ fullName: input });
  if (candidates.length === 1) return candidates[0].id;
  return null;
}

function extractNameAfterKeywords(message, keywords) {
  const lowerMsg = (message || "").toLowerCase();
  for (const keyword of keywords) {
    const idx = lowerMsg.indexOf(keyword);
    if (idx !== -1) {
      const raw = message.substring(idx + keyword.length).trim();
      const cleaned = raw.replace(/[?.,!]/g, "");
      if (cleaned) return cleaned;
    }
  }
  return "";
}

function parseLegacyToolCall(content) {
  if (!content) return null;
  const match = content.match(/<function\s*=\s*([a-zA-Z0-9_]+)>\s*([\s\S]*?)\s*<\/function>/i);
  if (!match) return null;
  const functionName = match[1];
  let functionArgs = {};
  try {
    functionArgs = JSON.parse(match[2]);
  } catch (error) {
    functionArgs = {};
  }
  return { functionName, functionArgs };
}

// Local mock AI engine as fallback when GROQ_API_KEY is not defined
async function localFallbackAI(message) {
  const normalizedMsg = normalizeText(message);
  const studentCode = extractStudentCode(message);
  const isGradeQuery = ["diem", "ket qua", "hoc luc", "bang diem"].some(k => normalizedMsg.includes(k));
  const isProfileQuery = [
    "thong tin hoc vien",
    "ho so hoc vien",
    "thong tin ca nhan",
    "thong tin phu huynh",
    "phu huynh",
    "so dien thoai",
    "sdt",
    "dia chi",
    "bo me",
    "cha me"
  ].some(k => normalizedMsg.includes(k));
  const isSystemQuery = [
    "he thong",
    "thong ke",
    "bao nhieu",
    "phan doan",
    "khoi",
    "lop",
    "nien hoc",
    "giao ly vien"
  ].some(k => normalizedMsg.includes(k));
  const isStudentContext = normalizedMsg.includes("hoc vien") && !normalizedMsg.includes("thong ke") && !normalizedMsg.includes("bao nhieu");
  const wantsBlockDetails = [
    "danh sach lop",
    "cac lop",
    "lop nao",
    "phan doan nao",
    "khoi nao",
    "co nhung lop",
    "co nhung phan doan"
  ].some(k => normalizedMsg.includes(k));
  
  // 1. Check if user is asking for system stats (khối, lớp)
  if (isSystemQuery && !isGradeQuery && !isProfileQuery && !isStudentContext) {
    if (wantsBlockDetails || normalizedMsg.includes("phan doan") || normalizedMsg.includes("khoi") || normalizedMsg.includes("lop")) {
      const blockName = extractNameAfterKeywords(message, ["phân đoàn", "phan doan", "khối", "khoi", "lớp", "lop"]);
      const data = await getBlocksAndClasses({ blockName: blockName || undefined });
      if (data.error) {
        return `Dạ, ${data.error}`;
      }
      if (!data.blocks || data.blocks.length === 0) {
        return `Dạ, hiện tại chưa có dữ liệu phân đoàn/lớp trong niên học ${data.currentAcademicYear}.`;
      }
      let reply = `Dạ chào anh chị! Dưới đây là danh sách phân đoàn và lớp giáo lý trong niên học ${data.currentAcademicYear}:\n\n`;
      data.blocks.forEach((b, index) => {
        reply += `${index + 1}. **${b.name}** (${b.classCount} lớp)\n`;
        if (b.classes && b.classes.length > 0) {
          const classNames = b.classes.map(c => c.name).join(", ");
          reply += `   - Lớp: ${classNames}\n`;
        }
      });
      return reply;
    }

    const stats = await getSystemStats();
    if (stats.error) {
      return `Dạ, ${stats.error}`;
    }
    return `Dạ chào anh chị phụ huynh! Dưới đây là thông tin thống kê tổng quan của xứ đoàn trong niên học hiện tại (${stats.currentAcademicYear}):
 - **Tổng số phân đoàn (khối)**: ${stats.totalBlocks} phân đoàn.
 - **Tổng số lớp giáo lý**: ${stats.totalClasses} lớp đang sinh hoạt.
 - **Tổng số học viên**: ${stats.totalStudents} học viên.
 - **Tổng số giáo lý viên**: ${stats.totalTeachers} giáo lý viên.

Anh chị cần em hỗ trợ tra cứu bảng điểm hay thông tin chuyên cần của học viên nào không ạ?`;
  }

  // 2. Check if user is asking for a student's grades (điểm)
  if (isGradeQuery) {
    // Attempt to extract name
    const nameKeywords = [
      "điểm của học viên",
      "diem cua hoc vien",
      "điểm của em",
      "diem cua em",
      "điểm của",
      "diem cua",
      "kết quả của",
      "ket qua cua"
    ];
    let extractedName = extractNameAfterKeywords(message, nameKeywords);

    if (!extractedName && message.split(" ").length <= 4) {
      // If short message and has no keyword, treat the whole message minus words as the name
      extractedName = message.replace(/(điểm|diem|kết quả|ket qua|học lực|hoc luc|của|cua|em)/gi, "").trim();
    }

    const lookupQuery = studentCode || extractedName;
    if (lookupQuery) {
      const studentsFound = await searchStudentByName({ fullName: lookupQuery });
      
      if (studentsFound.length === 0) {
        return `Dạ, em đã tìm kiếm học viên **"${lookupQuery}"** trong danh sách xứ đoàn nhưng chưa thấy kết quả khớp. Anh chị vui lòng kiểm tra lại họ và tên chính xác của học viên (ví dụ: Lê Minh A) hoặc cung cấp Mã học viên giúp em nhé!`;
      }
      
      if (studentsFound.length > 1) {
        let reply = `Dạ, em tìm thấy **${studentsFound.length} học viên** khớp với tên **"${lookupQuery}"**. Anh chị vui lòng xác nhận chính xác học viên cần tra cứu:\n\n`;
        studentsFound.forEach((st, index) => {
          const dobStr = st.dob ? new Date(st.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật";
          reply += `${index + 1}. **${st.saint_name || ""} ${st.last_name} ${st.first_name}** - Mã HV: \`${st.code}\` (Ngày sinh: ${dobStr})\n`;
        });
        reply += `\nAnh chị có thể gõ cụ thể tên kèm Mã học viên hoặc gõ riêng Mã học viên để em tra cứu chính xác bảng điểm ạ!`;
        return reply;
      }

      // Found exactly 1 student
      const student = studentsFound[0];
      const details = await getStudentDetailsAndGrades({ studentId: student.id });
      
      if (details.error) {
        return `Dạ, em đã tìm thấy học viên **${student.saint_name || ""} ${student.last_name} ${student.first_name}** (Mã: \`${student.code}\`), tuy nhiên: ${details.error}`;
      }

      const info = details.studentInfo;
      let reply = `Dạ chào anh chị! Dưới đây là bảng điểm và thông tin chuyên cần của học viên **${student.saint_name || ""} ${student.last_name} ${student.first_name}**:\n\n`;
      if (!details.isCurrentYear) {
        reply += `*(Học viên chưa có lớp ở niên học hiện tại, đang hiển thị dữ liệu của niên học ${info.year_name}.)*\n\n`;
      }
      reply += `* **Lớp Giáo Lý**: ${info.class_name}\n`;
      reply += `* **Phân Đoàn**: ${info.block_name}\n`;
      reply += `* **Niên Khóa**: ${info.year_name}\n\n`;
      
      reply += `### BẢNG ĐIỂM CHI TIẾT:\n`;
      if (details.grades && details.grades.length > 0) {
        // Group by semester
        const semMap = {};
        details.grades.forEach(g => {
          if (!semMap[g.semester_name]) semMap[g.semester_name] = [];
          semMap[g.semester_name].push(g);
        });

        for (const [semName, semGrades] of Object.entries(semMap)) {
          reply += `\n**--- ${semName} ---**\n`;
          semGrades.forEach(g => {
            reply += `- ${g.score_type_name} (Lần ${g.score_order}): **${g.score_value ?? "-"}** ${g.note ? `*(${g.note})*` : ""}\n`;
          });
        }
      } else {
        reply += `*(Chưa có cột điểm nào được ghi nhận cho học viên này)*\n`;
      }
      
      return reply;
    }
  }

  // 3. Student profile information
  if (isProfileQuery || isStudentContext) {
    const profileKeywords = [
      "thông tin học viên",
      "thong tin hoc vien",
      "hồ sơ học viên",
      "ho so hoc vien",
      "thông tin",
      "thong tin",
      "hồ sơ",
      "ho so",
      "số điện thoại",
      "so dien thoai",
      "địa chỉ",
      "dia chi",
      "phụ huynh",
      "phu huynh",
      "bố mẹ",
      "bo me",
      "cha mẹ",
      "cha me"
    ];
    let extractedName = extractNameAfterKeywords(message, profileKeywords);
    if (!extractedName && message.split(" ").length <= 5) {
      extractedName = message.replace(/(thông tin|thong tin|hồ sơ|ho so|học viên|hoc vien|phụ huynh|phu huynh|bố mẹ|bo me|cha mẹ|cha me)/gi, "").trim();
    }

    const lookupQuery = studentCode || extractedName;
    if (!lookupQuery) {
      return "Dạ, anh chị vui lòng cho em biết tên hoặc Mã học viên để em tra cứu hồ sơ chính xác ạ.";
    }

    const studentsFound = await searchStudentByName({ fullName: lookupQuery });
    if (studentsFound.length === 0) {
      return `Dạ, em chưa tìm thấy học viên **"${lookupQuery}"** trong hệ thống. Anh chị vui lòng kiểm tra lại họ tên hoặc cung cấp Mã học viên giúp em nhé!`;
    }

    if (studentsFound.length > 1) {
      let reply = `Dạ, em tìm thấy **${studentsFound.length} học viên** khớp với **"${lookupQuery}"**. Anh chị vui lòng xác nhận học viên cần tra cứu:\n\n`;
      studentsFound.forEach((st, index) => {
        const dobStr = st.dob ? new Date(st.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật";
        reply += `${index + 1}. **${st.saint_name || ""} ${st.last_name} ${st.first_name}** - Mã HV: \`${st.code}\` (Ngày sinh: ${dobStr})\n`;
      });
      reply += `\nAnh chị vui lòng gõ rõ họ tên kèm Mã học viên để em tra cứu chính xác hồ sơ ạ!`;
      return reply;
    }

    const student = studentsFound[0];
    const profile = await getStudentProfile({ studentId: student.id });
    if (profile.error) {
      return `Dạ, em đã tìm thấy học viên **${student.saint_name || ""} ${student.last_name} ${student.first_name}** (Mã: \`${student.code}\`), tuy nhiên: ${profile.error}`;
    }

    const dobStr = profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật";
    let reply = `Dạ chào anh chị! Dưới đây là hồ sơ học viên **${profile.saint_name || ""} ${profile.last_name} ${profile.first_name}** (Mã: \`${profile.code}\`):\n\n`;
    reply += `* **Ngày sinh**: ${dobStr}\n`;
    reply += `* **Giới tính**: ${profile.gender || "Chưa cập nhật"}\n`;
    reply += `* **Tình trạng**: ${profile.status || "Chưa cập nhật"}\n`;
    reply += `* **Lớp hiện tại**: ${profile.class_name || "Chưa xếp lớp"}\n`;
    reply += `* **Phân đoàn**: ${profile.block_name || "Chưa cập nhật"}\n`;
    reply += `* **Niên khóa**: ${profile.year_name || "Chưa cập nhật"}\n`;
    if (profile.father_name || profile.mother_name) {
      reply += `\n**Thông tin phụ huynh:**\n`;
      if (profile.father_name) {
        reply += `- Cha: ${profile.father_saint_name ? `${profile.father_saint_name} ` : ""}${profile.father_name}\n`;
      }
      if (profile.mother_name) {
        reply += `- Mẹ: ${profile.mother_saint_name ? `${profile.mother_saint_name} ` : ""}${profile.mother_name}\n`;
      }
    }
    if (profile.phone || profile.address) {
      reply += `\n**Liên hệ:**\n`;
      if (profile.phone) reply += `- SĐT: ${profile.phone}\n`;
      if (profile.address) reply += `- Địa chỉ: ${profile.address}\n`;
    }

    return reply;
  }

  // 4. Fallback to general conversational helper
  return `Dạ chào anh chị phụ huynh! Em là Trợ lý Giáo Lý viên ${systemName} AI. Em có thể hỗ trợ anh chị:
1. **Tra cứu bảng điểm chi tiết** của con em (ví dụ: *"Xem điểm của em Lê Minh A"*).
2. **Tra cứu hồ sơ học viên** (ví dụ: *"Thông tin học viên Lê Minh A"*).
3. **Xem thống kê hoặc danh sách lớp học** của xứ đoàn (ví dụ: *"Giáo xứ hiện có bao nhiêu khối lớp"*).

Anh chị vui lòng nhập câu hỏi hoặc gõ tên học viên để em hỗ trợ nhé!`;
}

// Main API Handler for Chatbot Chat
const handleChat = async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      reply: "Dữ liệu yêu cầu không hợp lệ. Danh sách tin nhắn trống."
    });
  }

  const userMessage = messages[messages.length - 1].content;
  const apiKey = process.env.GROQ_API_KEY;

  // Use local fallback if API key is not set
  if (!apiKey || apiKey.startsWith("your_")) {
    const reply = await localFallbackAI(userMessage);
    return res.status(200).json({
      success: true,
      reply
    });
  }

  // Real Groq API Implementation with Tool Calling Loop
  try {
    const systemPrompt = {
      role: "system",
        content: `Bạn là Trợ Lý Giáo Lý Viên và Ban Trị Sự thông minh của Xứ Đoàn Thiếu Nhi Thánh Thể Nhã Lộng.
 Hỗ trợ phụ huynh tra cứu điểm số, tình hình chuyên cần, hồ sơ học viên và thông tin hệ thống (khối, lớp, giáo lý viên, niên học hiện tại).
 QUY TẮC QUAN TRỌNG:
 1. Luôn phản hồi lịch sự, lễ phép, tôn trọng, xưng hô phù hợp (ví dụ: 'Dạ chào anh chị phụ huynh, em là Trợ lý ${systemName} AI...', 'Học viên', 'Tên Thánh').
 2. Nếu câu hỏi liên quan đến điểm số hoặc thông tin hệ thống/hồ sơ học viên, hãy gọi các công cụ (tools) được cung cấp. KHÔNG tự bịa ra điểm số hoặc dữ liệu hệ thống.
 3. Nếu tìm thấy nhiều học viên trùng tên, hãy liệt kê danh sách kèm Ngày sinh/Mã học viên để phụ huynh xác nhận lại học viên chính xác.
 4. Khi cần thông tin phân đoàn/lớp chi tiết, hãy gọi getBlocksAndClasses. Khi cần hồ sơ học viên, hãy gọi searchStudentByName trước, sau đó getStudentProfile.
 5. Nếu học viên chưa có lớp ở niên học hiện tại, có thể hiển thị dữ liệu niên học gần nhất và nêu rõ.
 6. KHÔNG hiển thị lệnh tool/function trong câu trả lời; chỉ trả về nội dung cho phụ huynh.` 
      };

    const fullMessages = [systemPrompt, ...messages];

    // Call Groq API via Fetch
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: fullMessages,
        tools: chatTools,
        tool_choice: "auto"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const responseMessage = data.choices[0].message;
    let toolCalls = responseMessage.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      const legacyCall = parseLegacyToolCall(responseMessage.content);
      if (legacyCall) {
        toolCalls = [
          {
            id: "legacy-tool-1",
            type: "function",
            function: {
              name: legacyCall.functionName,
              arguments: JSON.stringify(legacyCall.functionArgs || {})
            }
          }
        ];
        fullMessages.push({
          role: "assistant",
          tool_calls: toolCalls
        });
      }
    } else {
      fullMessages.push(responseMessage);
    }

    // Check if AI requested a tool call
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let functionResult;

        if (functionName === "getSystemStats") {
          functionResult = await getSystemStats();
        } else if (functionName === "getBlocksAndClasses") {
          functionResult = await getBlocksAndClasses(functionArgs);
        } else if (functionName === "searchStudentByName") {
          functionResult = await searchStudentByName(functionArgs);
        } else if (functionName === "getStudentProfile") {
          functionResult = await getStudentProfile(functionArgs);
        } else if (functionName === "getStudentDetailsAndGrades") {
          functionResult = await getStudentDetailsAndGrades(functionArgs);
        } else {
          functionResult = { error: "Công cụ không được hỗ trợ." };
        }

        fullMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(functionResult)
        });
      }

      // Second call to get final conversational response
      const secondResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: fullMessages
        })
      });

      if (!secondResponse.ok) {
        throw new Error("Lỗi khi gửi kết quả tool gọi hàm lần 2 cho Groq.");
      }

      const secondData = await secondResponse.json();
      return res.status(200).json({
        success: true,
        reply: secondData.choices[0].message.content
      });
    }

    // AI returned conversational reply directly
    return res.status(200).json({
      success: true,
      reply: responseMessage.content
    });

  } catch (error) {
    console.error("Lỗi khi gọi Groq API:", error);
    // Graceful fallback to local mock engine to avoid crashing for the user
    const fallbackReply = await localFallbackAI(userMessage);
    return res.status(200).json({
      success: true,
      reply: `*(Đang hiển thị phản hồi từ Công cụ nội bộ do kết nối Groq gặp sự cố)*\n\n${fallbackReply}`
    });
  }
};

module.exports = {
  handleChat
};

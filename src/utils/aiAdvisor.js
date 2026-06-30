/**
 * AI Advisor Utility for Energy Tracker
 * Provides personalized, friendly advice and feedback in Thai based on energy levels and reasons.
 */

// Positive keywords to track what boosts team energy
const POSITIVE_KEYWORDS = [
  { key: 'กาแฟ', label: '☕ กาแฟแก้วโปรด' },
  { key: 'ชา', label: '🍵 ชาอุ่นๆ / ชาไข่มุก' },
  { key: 'นอน', label: '😴 นอนหลับเต็มอิ่ม' },
  { key: 'พักผ่อน', label: '🛌 การพักผ่อนเต็มที่' },
  { key: 'เพลง', label: '🎵 ฟังเพลงเพิ่มพลัง' },
  { key: 'คุย', label: '💬 คุยเล่นกับเพื่อนร่วมงาน' },
  { key: 'งานเสร็จ', label: '✅ งานเสร็จตามเป้า / เคลียร์งานได้' },
  { key: 'บรีฟดี', label: '📢 Morning Brief สนุก / มีพลัง' },
  { key: 'ออกกำลัง', label: '🏃‍♂️ ออกกำลังกายตอนเช้า' },
  { key: 'กิน', label: '🍛 อาหารมื้ออร่อย' },
  { key: 'แดด', label: '☀️ แสงแดดยามเช้า' },
  { key: 'ธรรมะ', label: '🧘‍♂️ การนั่งสมาธิ / มีสติ' }
];

/**
 * Extracts positive factors from a text reason
 * @param {string} reason 
 * @returns {string[]} matched labels
 */
export function extractEnergyBoosters(reason) {
  if (!reason) return [];
  const lowercaseReason = reason.toLowerCase();
  const matched = [];
  for (const item of POSITIVE_KEYWORDS) {
    if (lowercaseReason.includes(item.key)) {
      matched.push(item.label);
    }
  }
  return matched;
}

/**
 * Generates personalized AI advice based on energy, reason, period, and previous score
 * @param {number} score 1-100
 * @param {string} reason
 * @param {string} nickname
 * @param {string} period 'morning' | 'morning_brief' | 'afternoon'
 * @param {number|null} prevScore score from the morning if evaluating morning brief
 * @returns {object} { title: string, text: string, type: 'low'|'medium'|'high' }
 */
export function getAIAdvice(score, reason, nickname, period, prevScore = null) {
  let title = '';
  let text = '';
  let type = 'medium';

  // Determine energy level type
  if (score < 45) {
    type = 'low';
  } else if (score > 75) {
    type = 'high';
  } else {
    type = 'medium';
  }

  // Reason analysis for custom keywords
  const hasCoffee = reason.includes('กาแฟ') || reason.includes('คาเฟอีน');
  const hasSleepy = reason.includes('ง่วง') || reason.includes('นอนน้อย') || reason.includes('ดึก');
  const hasStressed = reason.includes('เครียด') || reason.includes('งานเยอะ') || reason.includes('เร่ง');
  const hasHappy = reason.includes('ดีใจ') || reason.includes('มีความสุข') || reason.includes('แฮปปี้') || reason.includes('สนุก');

  // 1. Special case: After Morning Brief comparison
  if (period === 'morning_brief' && prevScore !== null) {
    const diff = score - prevScore;
    if (diff > 0) {
      title = '🎉 ว้าว! พลังใจพุ่งขึ้นหลัง Morning Brief';
      text = `สุดยอดเลยครับคุณ ${nickname}! พลังงานบวกเพิ่มขึ้นตั้ง ${diff} คะแนนหลังกิจกรรมเช้านี้ แสดงว่าโฮสต์ผู้จัด Morning Brief วันนี้ทำหน้าที่ได้ดีมาก กระตุ้นความสดใสให้ทีมได้จริง ๆ 👏 ชื่นชมความกระตือรือร้นของวันนี้เลยครับ!`;
      return { title, text, type: 'high' };
    } else if (diff < 0) {
      title = '💡 เอ๊ะ พลังงานลดลงนิดนึงนะ';
      text = `คุณ ${nickname} ครับ พลังงานรอบนี้ลดลงไป ${Math.abs(diff)} คะแนนหลังจบ Morning Brief กิจกรรมเช้านี้ตึงเครียดไปนิดนึงหรือเปล่านะ? ไม่เป็นไรนะครับ ลองยืดเส้นยืดสาย บิดขี้เกียจสักหน่อย แล้วค่อย ๆ ลุยงานกันนะ`;
      return { title, text, type: 'low' };
    }
  }

  // 2. Standard cases based on scores & keywords
  if (type === 'low') {
    title = '💚 ส่งความห่วงใยและพลังใจให้นะครับ';
    if (hasSleepy) {
      text = `คุณ ${nickname} รู้สึกง่วงนอนใช่ไหมครับ... คะแนนแค่ ${score} เอง ลองลุกไปล้างหน้าด้วยน้ำเย็น ๆ หรือหาชา/กาแฟร้อน ๆ ดื่มดูนะครับ ถ้าเป็นไปได้ลองตั้งนาฬิกาปลุกสัก 10 นาทีงีบสั้น ๆ ช่วงพักเที่ยงดูนะ`;
    } else if (hasStressed) {
      text = `เข้าใจเลยครับว่าช่วงนี้อาจจะมีเรื่องให้ตึงเครียดหรือกังวลอยู่ พลังงานแค่ ${score} บ่งบอกว่าจิตใจต้องการพักผ่อน ลองแบ่งงานใหญ่เป็นงานย่อย ๆ ค่อย ๆ ทำทีละนิด และอย่าลืมสูดหายใจเข้าลึก ๆ นับ 1 ถึง 5 ช้า ๆ นะครับ`;
    } else {
      text = `ดูเหมือนพลังใจของยอดฝีมืออย่างคุณ ${nickname} วันนี้จะดรอปลงไปอยู่ที่ ${score} คะแนนนะครับ ไม่เป็นไรเลยที่จะรู้สึกเหนื่อยล้าหรือพลังงานต่ำในบางวัน ลองพักสายตาจากหน้าจอคอมพิวเตอร์สัก 2-3 นาที แล้วฟังเพลงจังหวะสบาย ๆ ที่ชอบดูนะ`;
    }
  } else if (type === 'high') {
    title = '🔥 พลังงานเต็มถัง พร้อมลุยล้านเปอร์เซ็นต์!';
    if (hasHappy) {
      text = `ยินดีด้วยครับที่คุณ ${nickname} มีความสุขมากในวันนี้! พลังงานล้นเปี่ยม ${score} คะแนนแบบนี้ รอยยิ้มของคุณจะช่วยเติมพลังให้กับคนรอบข้างได้แน่ ๆ ลองทักทายหรือแชร์ความสุขนี้ให้เพื่อนร่วมงานฟังบ้างนะ!`;
    } else if (hasCoffee) {
      text = `อื้อหือ! กาแฟแก้วโปรดออกฤทธิ์แรงมากครับคุณ ${nickname}! พลังพุ่งถึง ${score} คะแนน สมองกำลังแล่นฉิวเลย ช่วงนี้เหมาะที่สุดในการเคลียร์งานที่ต้องใช้พลังความคิดสร้างสรรค์เยอะ ๆ ลุยเลยครับ!`;
    } else {
      text = `พลังงานสูงถึง ${score} คะแนน ยอดเยี่ยมที่สุดครับคุณ ${nickname}! วันนี้พร้อมลุยงานได้อย่างมีประสิทธิภาพแน่นอน ขอให้รักษาจังหวะการทำงานดี ๆ แบบนี้ไว้ตลอดทั้งวันนะครับ คุณสุดยอดมาก! 🚀`;
    }
  } else {
    // Medium energy
    title = '✨ พลังงานระดับกำลังดี บาลานซ์สุด ๆ';
    if (hasSleepy) {
      text = `คุณ ${nickname} เริ่มรู้สึกเนือย ๆ หรือสะลึมสะลือใช่ไหมครับ พลังงานอยู่ที่ ${score} ลองลุกขึ้นขยับร่างกายสักนิดเพื่อกระตุ้นระบบไหลเวียนโลหิตดูนะ หรือแวะไปทักทายพูดคุยกับเพื่อนร่วมงานสัก 2-3 ประโยคเพื่อเปลี่ยนบรรยากาศครับ`;
    } else if (hasStressed) {
      text = `ดูเหมือนจะมีงานเร่งเข้ามาบีบใช่ไหมครับ คะแนนพลังงาน ${score} ถือว่ายังรับมือได้ดีอยู่ แต่อย่าลืมหาจังหวะพักระหว่างชั่วโมงการทำงานบ้างนะ (ทำงาน 50 นาที พัก 10 นาที) เพื่อไม่ให้ล้าเกินไปช่วงปลายวันครับ`;
    } else {
      text = `ระดับพลังงาน ${score} คะแนน ถือเป็นจุดสมดุลที่ดีมากครับคุณ ${nickname} ไม่มากไม่น้อยเกินไป สมองพร้อมโฟกัสงานแบบนิ่ง ๆ ได้ยาว ๆ เลย ขอให้วันนี้ทำงานด้วยความสุขและสติที่มั่นคงตลอดวันนะครับ`;
    }
  }

  return { title, text, type };
}

/**
 * Generates an appropriate blessing message after energy submission
 * @param {number} score 
 * @returns {string} blessing message
 */
export function getBlessingMessage(score) {
  if (score < 40) {
    return 'ขอส่งกำลังใจให้คุณแบบจัดเต็ม พักผ่อนและผ่อนคลายจิตใจบ้างนะครับ ❤️';
  } else if (score > 80) {
    return 'ขอให้เป็นวันที่ยอดเยี่ยม สนุกกับงานและส่งต่อความสุขให้เพื่อนร่วมทีมนะครับ! 🌟';
  } else {
    return 'ขอให้งานวันนี้ลื่นไหล ไร้อุปสรรค ทำงานด้วยจิตใจที่สงบและมีประสิทธิภาพครับ! ✌️';
  }
}

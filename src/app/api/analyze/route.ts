import { NextResponse } from "next/server";
import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type {
  AnalyzeResponse,
  ManipulationTactic,
  RiskLevel,
} from "@/types/scam";

const MODEL_NAME = "gemini-3.5-flash-lite";
const MAX_MESSAGE_LENGTH = 2000;
const MOCK_DELAY_MS = 600;
const MYANMAR_UNICODE_REGEX = /[\u1000-\u109F]/;
const SUSPICIOUS_LINK_REGEX = /(https?:\/\/|www\.|\.xyz\b|\.top\b|\.click\b|\.ru\b)/i;

const SYSTEM_INSTRUCTION = `You are ScamShield, a consumer fraud and cybersecurity analyst. Analyze the user's pasted message for signs of phishing, job scams, advance-fee fraud, impersonation, or social engineering. Return a strict JSON object with \`risk_level\` ("LOW" for 0–33, "MEDIUM" for 34–69, "HIGH" for 70–100), \`risk_score\` (0–100), \`verdict_summary\` (1–2 clear sentences), \`tactics\` (array of detected red flags; return an empty array if legitimate), and \`next_steps\` (3 specific, safe actions the user should take). Be concise, objective, and easy for a teenager or parent to understand.

Language rule: Detect the language of the user's input message (English or Burmese / Myanmar Unicode). Write \`verdict_summary\`, \`tactics[].name\`, \`tactics[].explanation\`, and \`next_steps[]\` in that same language, while keeping all JSON keys and the \`risk_level\` enum ("LOW" | "MEDIUM" | "HIGH") strictly in English.`;

const ANALYZE_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    risk_level: {
      type: Type.STRING,
      format: "enum",
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: 'Risk category: "LOW" (0-33), "MEDIUM" (34-69), or "HIGH" (70-100).',
    },
    risk_score: {
      type: Type.INTEGER,
      minimum: 0,
      maximum: 100,
      description: "Integer risk score from 0 to 100.",
    },
    verdict_summary: {
      type: Type.STRING,
      description: "1 to 2 plain-language sentences summarizing the risk verdict.",
    },
    tactics: {
      type: Type.ARRAY,
      description: "Detected manipulation tactics, or empty array if legitimate.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Short name of the manipulation tactic.",
          },
          explanation: {
            type: Type.STRING,
            description: "One concise sentence explaining why this tactic applies.",
          },
        },
        required: ["name", "explanation"],
      },
    },
    next_steps: {
      type: Type.ARRAY,
      description: "Exactly 3 concrete, actionable safety steps.",
      minItems: "3",
      maxItems: "3",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: [
    "risk_level",
    "risk_score",
    "verdict_summary",
    "tactics",
    "next_steps",
  ],
};

const DEFAULT_NEXT_STEPS_EN = [
  "Do not click links, reply, or share personal details yet.",
  "Verify the claim independently through an official app or phone number.",
  "Ask a trusted family member or friend for a second opinion before acting.",
];

const DEFAULT_NEXT_STEPS_MY = [
  "လင့်ခ်များကို မနှိပ်ပါနှင့်၊ စာပြန်ခြင်း သို့မဟုတ် ကိုယ်ရေးအချက်အလက်ပေးခြင်း မပြုလုပ်ပါနှင့်။",
  "တရားဝင်အက်ပ် သို့မဟုတ် တရားဝင်ဖုန်းနံပါတ်မှတစ်ဆင့် ကိုယ်တိုင်ပြန်လည်စစ်ဆေးပါ။",
  "မဆောင်ရွက်မီ ယုံကြည်ရသော မိသားစုဝင် သို့မဟုတ် မိတ်ဆွေတစ်ဦးနှင့် တိုင်ပင်ပါ။",
];

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "HIGH";
  if (score >= 34) return "MEDIUM";
  return "LOW";
}

function buildMockResponse(message: string): AnalyzeResponse {
  const lower = message.toLowerCase();
  const isBurmese = MYANMAR_UNICODE_REGEX.test(message);

  if (lower.includes("otp") || lower.includes("suspended")) {
    return isBurmese
      ? {
          risk_level: "HIGH",
          risk_score: 94,
          verdict_summary:
            "ဤစာသည် အကောင့်ပိတ်မည်ဟု ခြိမ်းခြောက်ပြီး OTP နှင့် အချက်အလက်ခိုးယူရန် ကြိုးစားသည့် Phishing လိမ်လည်မှု ဖြစ်နိုင်ခြေ အလွန်မြင့်မားပါသည်။",
          tactics: [
            {
              name: "အရေးကြီးသယောင် ဖိအားပေးခြင်း",
              explanation:
                "အချိန်တိုအတွင်း အကောင့်ပိတ်မည်ဟု ပြောဆိုကာ စဉ်းစားချိန်မရဘဲ အလျင်စလို လုပ်ဆောင်စေရန် ဖိအားပေးထားပါသည်။",
            },
            {
              name: "OTP နှင့် လျှို့ဝှက်ကုဒ် တောင်းခံခြင်း",
              explanation:
                "တရားဝင်ဘဏ်များသည် သင့် OTP ဂဏန်း ၆ လုံးကို စာတို သို့မဟုတ် လင့်ခ်မှတစ်ဆင့် မည်သည့်အခါမျှ မတောင်းခံပါ။",
            },
            {
              name: "သံသယဖြစ်ဖွယ် လင့်ခ်",
              explanation:
                "တရားဝင်ဘဏ်ဝက်ဘ်ဆိုက်မဟုတ်သော အတုအယောင် ဒိုမိန်းလင့်ခ်သို့ ဝင်ရောက်ရန် လမ်းညွှန်ထားပါသည်။",
            },
          ],
          next_steps: [
            "စာထဲပါ လင့်ခ်ကို လုံးဝမနှိပ်ပါနှင့်၊ OTP ကုဒ်ကိုလည်း မည်သူ့ကိုမျှ မပို့ပါနှင့်။",
            "သင့်ဘဏ်၏ တရားဝင်အက်ပ်ကို ဖွင့်ကြည့်ခြင်း သို့မဟုတ် ဘဏ်ကတ်နောက်ကျောပါ တရားဝင်ဖုန်းနံပါတ်သို့ ဆက်သွယ်စစ်ဆေးပါ။",
            "စာပို့သူနံပါတ်ကို Block လုပ်ပြီး သံသယရှိပါက ဘဏ်သို့ ချက်ချင်းအကြောင်းကြားပါ။",
          ],
        }
      : {
          risk_level: "HIGH",
          risk_score: 94,
          verdict_summary:
            "This message is almost certainly a bank phishing scam designed to steal your login credentials and one-time passcode.",
          tactics: [
            {
              name: "False Urgency",
              explanation:
                "Threatening account suspension within hours is meant to panic you into acting before verifying.",
            },
            {
              name: "Credential & OTP Harvesting",
              explanation:
                "Legitimate banks never ask you to reply with your 6-digit OTP or enter it via a text link.",
            },
            {
              name: "Suspicious Lookalike Link",
              explanation:
                "The URL uses an unofficial domain instead of your bank's verified website.",
            },
          ],
          next_steps: [
            "Do not tap the link or reply with your OTP or password.",
            "Check your account directly inside your official banking app or by calling the number on your bank card.",
            "Block the sender and report the phishing message to your bank's support team.",
          ],
        };
  }

  if (lower.includes("registration fee") || lower.includes("$150/day")) {
    return isBurmese
      ? {
          risk_level: "HIGH",
          risk_score: 89,
          verdict_summary:
            "အလုပ်စတင်ရန် ကြိုတင်ငွေပေးသွင်းခိုင်းသည့် အွန်လိုင်းအလုပ်လိမ်လည်မှု (Advance-Fee Job Scam) ဖြစ်နိုင်ခြေ မြင့်မားပါသည်။",
          tactics: [
            {
              name: "ကြိုတင်ငွေတောင်းခံခြင်း",
              explanation:
                "စစ်မှန်သော အလုပ်ရှင်များသည် အလုပ်ဝင်ခွင့် သို့မဟုတ် VIP အလုပ်များရရှိရန် မှတ်ပုံတင်ကြေး မတောင်းခံပါ။",
            },
            {
              name: "မယုံနိုင်လောက်အောင် များပြားသော လစာ",
              explanation:
                "ဗီဒီယို Like နှိပ်ရုံဖြင့် တစ်နေ့ $150 ရမည်ဆိုခြင်းမှာ သားကောင်များကို ဆွဲဆောင်သည့် ထောင်ချောက်ဖြစ်ပါသည်။",
            },
          ],
          next_steps: [
            "KBZPay သို့မဟုတ် မည်သည့်ငွေပေးချေမှုနည်းလမ်းဖြင့်မျှ မှတ်ပုံတင်ကြေး လုံးဝမလွှဲပါနှင့်။",
            "စကားပြောဆိုမှုကို ရပ်တန့်ပြီး ထို Telegram အကောင့်ကို Block နှင့် Report လုပ်ပါ။",
            "မိတ်ဆွေများနှင့် မိသားစုဝင်များပါ မလိမ်ခံရစေရန် ဤအလုပ်လိမ်လည်မှုပုံစံကို သတိပေးမျှဝေပါ။",
          ],
        }
      : {
          risk_level: "HIGH",
          risk_score: 89,
          verdict_summary:
            "This shows classic signs of an advance-fee task scam that lures victims with easy money and then demands an upfront payment.",
          tactics: [
            {
              name: "Upfront Payment Demand",
              explanation:
                "Requiring a registration fee via mobile wallet to unlock tasks is a major red flag for job fraud.",
            },
            {
              name: "Unrealistic Pay Promise",
              explanation:
                "Offering $150/day for simple video likes is designed to hook targets with too-good-to-be-true earnings.",
            },
          ],
          next_steps: [
            "Do not send any registration fee or personal ID photos via KBZPay or any other wallet.",
            "Stop replying, block the recruiter account, and report it inside Telegram.",
            "Warn friends or classmates, as these task scams often target students and job seekers.",
          ],
        };
  }

  if (
    (lower.includes("prepaid") || lower.includes("parcel")) &&
    !SUSPICIOUS_LINK_REGEX.test(message)
  ) {
    return isBurmese
      ? {
          risk_level: "LOW",
          risk_score: 12,
          verdict_summary:
            "ဤစာသည် ပုံမှန်ပစ္စည်းပို့ဆောင်မှု အသိပေးစာတစ်ခုနှင့် တူညီပြီး လိမ်လည်လှည့်ဖြားသည့် လက္ခဏာ မတွေ့ရပါ။",
          tactics: [],
          next_steps: [
            "စာထဲပါ အော်ဒါနံပါတ်ကို သင်ကိုယ်တိုင် မှာယူထားသည့် စျေးဝယ်အက်ပ်ထဲတွင် တိုက်ဆိုင်စစ်ဆေးပါ။",
            "ကြိုတင်ငွေရှင်းပြီးသားဖြစ်၍ ပစ္စည်းလာပို့သူက အပိုငွေတောင်းခံလာပါက မပေးဘဲ ဆိုင်သို့မေးမြန်းပါ။",
            "ပစ္စည်းမရောက်မချင်း ကိုယ်ရေးကိုယ်တာ OTP သို့မဟုတ် ဘဏ်အချက်အလက်များကို မမျှဝေပါနှင့်။",
          ],
        }
      : {
          risk_level: "LOW",
          risk_score: 12,
          verdict_summary:
            "This looks like a routine delivery update with no suspicious links, urgency, or payment requests.",
          tactics: [],
          next_steps: [
            "Confirm order #4821 matches a real purchase inside your shopping app or email receipt.",
            "Since it says prepaid, refuse any unexpected cash-on-delivery fee at the door.",
            "Avoid sharing personal ID or OTP codes unless required by your verified courier.",
          ],
        };
  }

  return isBurmese
    ? {
        risk_level: "MEDIUM",
        risk_score: 55,
        verdict_summary:
          "ဤစာသည် ထင်ရှားသော လိမ်လည်မှုတစ်ခုဟု အတိအကျမပြောနိုင်သော်လည်း အတည်မပြုရသေးသည့် အချက်အလက်များပါဝင်သဖြင့် သတိထားစစ်ဆေးသင့်ပါသည်။",
        tactics: [
          {
            name: "အတည်မပြုရသေးသော ပေးပို့သူ",
            explanation:
              "စာပေးပို့သူသည် မည်သူမည်ဝါဖြစ်ကြောင်း တရားဝင်အတည်ပြုနိုင်သည့် အချက်အလက် မပါဝင်ပါ။",
          },
        ],
        next_steps: DEFAULT_NEXT_STEPS_MY,
      }
    : {
        risk_level: "MEDIUM",
        risk_score: 55,
        verdict_summary:
          "This message does not show an obvious scam signature, but it cannot be verified from the text alone and warrants caution.",
        tactics: [
          {
            name: "Unverified Sender Context",
            explanation:
              "The message asks for your attention or trust without verifiable official context.",
          },
        ],
        next_steps: DEFAULT_NEXT_STEPS_EN,
      };
}

function normalizeAnalyzeResponse(
  raw: unknown,
  isBurmeseInput: boolean
): AnalyzeResponse | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const rawScore = Number(record.risk_score);
  if (!Number.isFinite(rawScore)) {
    return null;
  }

  const risk_score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const risk_level = scoreToRiskLevel(risk_score);

  const verdict_summary =
    typeof record.verdict_summary === "string"
      ? record.verdict_summary.trim()
      : "";
  if (!verdict_summary) {
    return null;
  }

  const tactics: ManipulationTactic[] = Array.isArray(record.tactics)
    ? record.tactics
        .filter((item): item is Record<string, unknown> => {
          return Boolean(item && typeof item === "object");
        })
        .map((item) => ({
          name: typeof item.name === "string" ? item.name.trim() : "",
          explanation:
            typeof item.explanation === "string" ? item.explanation.trim() : "",
        }))
        .filter((item) => item.name.length > 0 && item.explanation.length > 0)
    : [];

  const parsedSteps = Array.isArray(record.next_steps)
    ? record.next_steps
        .filter((step): step is string => typeof step === "string")
        .map((step) => step.trim())
        .filter((step) => step.length > 0)
    : [];

  const fallbackSteps = isBurmeseInput
    ? DEFAULT_NEXT_STEPS_MY
    : DEFAULT_NEXT_STEPS_EN;
  const next_steps = parsedSteps.slice(0, 3);
  while (next_steps.length < 3) {
    next_steps.push(fallbackSteps[next_steps.length]);
  }

  return {
    risk_level,
    risk_score,
    verdict_summary,
    tactics,
    next_steps,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Please enter a message to analyze." },
      { status: 400 }
    );
  }

  const rawMessage =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).message
      : undefined;

  if (typeof rawMessage !== "string" || rawMessage.trim().length === 0) {
    return NextResponse.json(
      { error: "Please enter a message to analyze." },
      { status: 400 }
    );
  }

  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: "Message exceeds 2,000 characters." },
      { status: 400 }
    );
  }

  const trimmedMessage = rawMessage.trim();
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const isMockMode = process.env.MOCK_MODE === "true" || !apiKey;

  if (isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    return NextResponse.json(buildMockResponse(trimmedMessage));
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: trimmedMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ANALYZE_RESPONSE_SCHEMA,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini.");
    }

    const parsedJson = JSON.parse(responseText) as unknown;
    const normalized = normalizeAnalyzeResponse(
      parsedJson,
      MYANMAR_UNICODE_REGEX.test(trimmedMessage)
    );
    if (!normalized) {
      throw new Error("Malformed analysis response payload.");
    }

    return NextResponse.json(normalized);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    console.error("ScamShield /api/analyze failure:", reason);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

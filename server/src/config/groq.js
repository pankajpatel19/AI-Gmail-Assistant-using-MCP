import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../../env.js";

const groq = new Groq({ apiKey: GROQ_API_KEY });

export default groq;

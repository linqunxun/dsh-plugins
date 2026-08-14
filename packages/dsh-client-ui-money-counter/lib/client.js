// Browser half of the money-counter plugin, packaged in the client bundle
// format the web app serves at /plugins/<id>/client.js.
//
// A bottom-right card that keeps earning money forever:
// - Shows a well-known person (avatar + bilingual name), rotated every 8s.
// - A "+$X" particle floats up continuously — the average particle amount
//   matches that person's per-second income, so the rate shows in the
//   money+ effect itself (no rate text on the card).
// - The grand total NEVER resets: it keeps accumulating across person
//   switches, page refreshes and restarts (persisted in localStorage; the
//   offline gap is caught up at the last person's rate).
// - Language follows the system/browser locale: Chinese when it starts with
//   "zh", English otherwise.
window.__ModuleLoader__.load({
	id: "dsh-client-ui-money-counter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");

		//#region money-counter component
		const CSS = `
			.dsh-income {
				position: fixed; right: 22px; bottom: 22px; z-index: 9999;
				pointer-events: none; user-select: none;
			}
			.dsh-income-card {
				position: relative;
				display: flex; align-items: center; gap: 12px;
				padding: 10px 16px 10px 12px; border-radius: 16px;
				background: linear-gradient(135deg, rgba(22,22,30,.94), rgba(34,30,20,.94));
				border: 1px solid rgba(255,200,60,.5);
				box-shadow: 0 0 18px rgba(255,190,40,.3), 0 6px 20px rgba(0,0,0,.35);
				backdrop-filter: blur(8px);
				pointer-events: auto; cursor: pointer;
				animation: dsh-income-in .5s ease-out;
			}
			.dsh-income-card:hover {
				border-color: rgba(255,200,60,.85);
				box-shadow: 0 0 26px rgba(255,200,60,.5), 0 6px 22px rgba(0,0,0,.35);
			}
			.dsh-income-avatar {
				width: 46px; height: 46px; border-radius: 50%; flex: none;
				object-fit: cover; border: 2px solid rgba(255,200,60,.7);
				background: linear-gradient(135deg, #3a3a4a, #55523a);
				display: flex; align-items: center; justify-content: center;
				color: #ffd76a; font-size: 20px; font-weight: 700;
			}
			.dsh-income-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
			.dsh-income-name { font-size: 14px; font-weight: 700; color: #fff; line-height: 1.2; white-space: nowrap; }
			.dsh-income-sub { font-size: 11px; color: rgba(255,255,255,.6); line-height: 1.2; white-space: nowrap; max-width: 190px; overflow: hidden; text-overflow: ellipsis; }
			.dsh-income-total {
				font-size: 17px; font-weight: 800; color: #ffe9a8; line-height: 1.3;
				font-variant-numeric: tabular-nums; white-space: nowrap;
				text-shadow: 0 0 12px rgba(255,200,60,.45);
			}
			.dsh-income-p {
				position: absolute; bottom: 56px; left: 50%;
				font-size: 16px; font-weight: 800; color: #ffd76a;
				background: rgba(10,10,14,.72);
				border: 1px solid rgba(255,200,60,.35);
				border-radius: 8px; padding: 2px 8px;
				text-shadow: 0 1px 4px rgba(0,0,0,.6);
				white-space: nowrap; opacity: 0; pointer-events: none;
				animation: dsh-income-float 2s ease-out forwards;
			}
			.dsh-income-p.neg {
				color: #ff8a7a;
				border-color: rgba(255,120,100,.45);
				text-shadow: 0 1px 4px rgba(120,20,10,.7);
			}
			@keyframes dsh-income-float {
				0%   { opacity: 0; transform: translate(-50%, 0) scale(.85); }
				15%  { opacity: 1; }
				100% { opacity: 0; transform: translate(-50%, -96px) scale(1.06); }
			}
			@keyframes dsh-income-in {
				0%   { opacity: 0; transform: translateY(8px) scale(.95); }
				100% { opacity: 1; transform: translateY(0) scale(1); }
			}
		`;

		// Rough per-second income estimates (public figures, entertainment only).
		// perSec may be negative (wealth-losing people make the total shrink).
		// Avatars are Wikipedia portrait thumbnails (hotlink-friendly).
		// bio is a one-line tagline (≤15 chars in each language) under the name.
		const PEOPLE = [
			{ id: "musk", name: { zh: "埃隆·马斯克", en: "Elon Musk" }, bio: { zh: "特斯拉与SpaceX创始人", en: "Tesla & SpaceX founder" }, perSec: 2700, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elon_Musk_-_54820081119_%28cropped%29.jpg/330px-Elon_Musk_-_54820081119_%28cropped%29.jpg" },
			{ id: "trump", name: { zh: "唐纳德·特朗普", en: "Donald Trump" }, bio: { zh: "美国第45、47任总统", en: "45th & 47th US President" }, perSec: 40, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg/330px-Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg" },
			{ id: "bezos", name: { zh: "杰夫·贝索斯", en: "Jeff Bezos" }, bio: { zh: "亚马逊创始人", en: "Amazon founder" }, perSec: 2500, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg/330px-260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg" },
			{ id: "gates", name: { zh: "比尔·盖茨", en: "Bill Gates" }, bio: { zh: "微软联合创始人", en: "Microsoft co-founder" }, perSec: 1300, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg/330px-Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg" },
			{ id: "buffett", name: { zh: "沃伦·巴菲特", en: "Warren Buffett" }, bio: { zh: "伯克希尔掌门人", en: "Berkshire chairman" }, perSec: 800, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/330px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg" },
			{ id: "zuckerberg", name: { zh: "马克·扎克伯格", en: "Mark Zuckerberg" }, bio: { zh: "Meta创始人", en: "Meta founder" }, perSec: 2000, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/F20250904AH-2824_%2854778373111%29_%283x4_cropped_on_Zuckerberg_following_the_rule_of_thirds%29.jpg/330px-F20250904AH-2824_%2854778373111%29_%283x4_cropped_on_Zuckerberg_following_the_rule_of_thirds%29.jpg" },
			{ id: "huang", name: { zh: "黄仁勋", en: "Jensen Huang" }, bio: { zh: "英伟达创始人", en: "NVIDIA founder" }, perSec: 2900, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jen-Hsun_Huang_2025.jpg/330px-Jen-Hsun_Huang_2025.jpg" },
			{ id: "ma", name: { zh: "马云", en: "Jack Ma" }, bio: { zh: "阿里巴巴创始人", en: "Alibaba founder" }, perSec: 300, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/20th_Anniversary_Schwab_Foundation_Gala_Dinner_%2844887783681%29_%28cropped%29.jpg/330px-20th_Anniversary_Schwab_Foundation_Gala_Dinner_%2844887783681%29_%28cropped%29.jpg" },
			{ id: "swift", name: { zh: "泰勒·斯威夫特", en: "Taylor Swift" }, bio: { zh: "流行天后", en: "Pop superstar" }, perSec: 45, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/330px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png" },
			{ id: "ronaldo", name: { zh: "C罗", en: "Cristiano Ronaldo" }, bio: { zh: "足坛传奇", en: "Football legend" }, perSec: 30, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg/330px-Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg" },
			{ id: "messi", name: { zh: "梅西", en: "Lionel Messi" }, bio: { zh: "足坛GOAT", en: "Football GOAT" }, perSec: 25, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg/330px-Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg" },
			{ id: "lebron", name: { zh: "勒布朗·詹姆斯", en: "LeBron James" }, bio: { zh: "NBA现役巨星", en: "NBA superstar" }, perSec: 20, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/330px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg" },
			{ id: "mbappe", name: { zh: "姆巴佩", en: "Kylian Mbappé" }, bio: { zh: "法国天才前锋", en: "French ace forward" }, perSec: 15, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg/330px-Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg" },
			{ id: "cook", name: { zh: "蒂姆·库克", en: "Tim Cook" }, bio: { zh: "苹果公司CEO", en: "Apple CEO" }, perSec: 2, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Tim_Cook_March_2026_%28cropped_2%29.jpg/330px-Tim_Cook_March_2026_%28cropped_2%29.jpg" },
			{ id: "luo", name: { zh: "罗永浩", en: "Luo Yonghao" }, bio: { zh: "锤子科技创始人", en: "Smartisan founder" }, perSec: -60, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Luo_Yonghao_at_BIT%2C_2010-cropped.JPG/330px-Luo_Yonghao_at_BIT%2C_2010-cropped.JPG" },
			{ id: "sbf", name: { zh: "山姆·班克曼", en: "Sam Bankman-Fried" }, bio: { zh: "FTX破产创始人", en: "Ex-FTX founder" }, perSec: -400, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Sam_Bankman-Fried_%28cropped%29.png/330px-Sam_Bankman-Fried_%28cropped%29.png" },
			{ id: "holmes", name: { zh: "伊丽莎白·霍姆斯", en: "Elizabeth Holmes" }, bio: { zh: "Theranos创始人", en: "Theranos founder" }, perSec: -150, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Elizabeth_Holmes_2014_cropped.jpg/330px-Elizabeth_Holmes_2014_cropped.jpg" }
		];

		// Durable grand-total state. localStorage survives page refreshes and
		// restarts; on mount the offline gap is caught up at the last person's rate.
		const STORAGE_KEY = "dsh-income-counter.v1";
		const BASE_TOTAL = 128888.66;
		//#endregion

		/** Required services: overlay registration only. */
		const inject = ["slots"];

		/** Client plugin body: register the bottom-right overlay entry. */
		function apply(ctx) {
			/**
			* Bottom-right earning card. Defined inside apply so it closes over
			* the plugin ctx (the static client bundle has no ambient ctx at
			* module scope).
			*/
			function MoneyCounter() {
				const [lang, setLang] = react.useState("zh");
				const [index, setIndex] = react.useState(0);
				const [total, setTotal] = react.useState(BASE_TOTAL);
				const [particles, setParticles] = react.useState([]);
				const [imgErr, setImgErr] = react.useState(false);
				const [imgReady, setImgReady] = react.useState(true);
				const [rotNonce, setRotNonce] = react.useState(0);
				const indexRef = react.useRef(0);
				const totalRef = react.useRef(BASE_TOTAL);
				const lastTsRef = react.useRef(Date.now());
				const seqRef = react.useRef(0);

				// System/browser language: Chinese when it starts with "zh".
				react.useEffect(() => {
					const navLang = String(window.navigator.language || "en").toLowerCase();
					setLang(navLang.startsWith("zh") ? "zh" : "en");
				}, []);

				// Load persisted total and catch up the offline gap.
				react.useEffect(() => {
					let saved = null;
					try {
						const raw = window.localStorage.getItem(STORAGE_KEY);
						if (raw !== null) {
							const d = JSON.parse(raw);
							if (typeof d.total === "number" && typeof d.lastTs === "number") saved = d;
						}
					} catch (e) { /* fresh start */ }
					let idx = 0;
					if (saved !== null) {
						const found = PEOPLE.findIndex((p) => p.id === saved.personId);
						if (found >= 0) idx = found;
						const gap = Math.max(0, (Date.now() - saved.lastTs) / 1000);
						totalRef.current = saved.total + gap * PEOPLE[idx].perSec;
					}
					indexRef.current = idx;
					lastTsRef.current = Date.now();
					setIndex(idx);
					setTotal(totalRef.current);
				}, []);

				// Tick: keep earning at the current person's rate, persist often.
				react.useEffect(() => {
					const timer = window.setInterval(() => {
						const now = Date.now();
						const delta = Math.max(0, (now - lastTsRef.current) / 1000);
						totalRef.current += delta * PEOPLE[indexRef.current].perSec;
						lastTsRef.current = now;
						setTotal(totalRef.current);
						try {
							window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
								total: totalRef.current,
								lastTs: now,
								personId: PEOPLE[indexRef.current].id
							}));
						} catch (e) { /* storage full/unavailable */ }
					}, 100);
					return () => window.clearInterval(timer);
				}, []);

				// Rotate to the next person every 8s (total keeps accumulating).
				// Depends on rotNonce: a manual click bumps it, restarting the timer.
				react.useEffect(() => {
					const timer = window.setInterval(() => {
						indexRef.current = (indexRef.current + 1) % PEOPLE.length;
						setIndex(indexRef.current);
						setImgErr(false);
						setImgReady(false);
					}, 8000);
					return () => window.clearInterval(timer);
				}, [rotNonce]);

				// Money+ particles: one per second, amount = the person's exact
				// per-second income (positive adds, negative subtracts).
				react.useEffect(() => {
					const timer = window.setInterval(() => {
						const id = ++seqRef.current;
						const amt = PEOPLE[indexRef.current].perSec;
						const dx = Math.round(Math.random() * 60 - 30);
						setParticles((ps) => [...ps.slice(-5), { id, amt, dx }]);
						window.setTimeout(() => {
							setParticles((ps) => ps.filter((p) => p.id !== id));
						}, 2000);
					}, 1000);
					return () => window.clearInterval(timer);
				}, []);

				const person = PEOPLE[index];
				const zh = lang === "zh";
				const name = person.name[zh ? "zh" : "en"];
				const bio = person.bio[zh ? "zh" : "en"];
				const initial = (name || bio).charAt(0).toUpperCase();
				const fmt = (n) => n.toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
				const avatar = imgErr
					? react.createElement("div", { className: "dsh-income-avatar" }, initial)
					: react.createElement("img", {
						className: "dsh-income-avatar",
						key: person.id,
						src: person.avatar,
						alt: name,
						style: { opacity: imgReady ? 1 : 0, transition: "opacity .3s ease" },
						onError: () => setImgErr(true),
						onLoad: () => setImgReady(true)
					});

				return react.createElement("div", { className: "dsh-income" },
					react.createElement("style", null, CSS),
					particles.map((p) => react.createElement("div", {
						key: p.id,
						className: "dsh-income-p" + (p.amt < 0 ? " neg" : ""),
						style: { marginLeft: p.dx + "px" }
					}, (p.amt < 0 ? "-$" : "+$") + fmt(Math.abs(p.amt)))),
					react.createElement("div", {
						className: "dsh-income-card",
						title: zh ? "点击切换人物" : "Click to switch person",
						onClick: () => {
							indexRef.current = (indexRef.current + 1) % PEOPLE.length;
							setIndex(indexRef.current);
							setImgErr(false);
							setImgReady(false);
							setRotNonce((n) => n + 1);
						}
					},
						avatar,
						react.createElement("div", { className: "dsh-income-body" },
							react.createElement("div", { className: "dsh-income-name" }, name),
							react.createElement("div", { className: "dsh-income-sub" }, bio),
							react.createElement("div", { className: "dsh-income-total" },
								(zh ? "已入账 $" : "earned $") + (total < 0 ? "-" : "") + fmt(Math.abs(total))
							)
						)
					)
				);
			}

			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "money-counter",
				order: 100,
				label: "\u6BCF\u79D2\u6536\u5165"
			}, MoneyCounter));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

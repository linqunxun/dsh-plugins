// Browser half of the money-counter plugin, packaged in the client bundle
// format the web app serves at /plugins/<id>/client.js.
//
// Simulates the per-second income of well-known people: shows the person's
// avatar, name (active locale), their per-second rate, and the total earned
// since this person was selected. Rotates through the roster every 8s;
// clicking the card switches to the next person.
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
			.dsh-income-sub { font-size: 11px; color: rgba(255,255,255,.55); line-height: 1.2; white-space: nowrap; }
			.dsh-income-rate {
				font-size: 12px; color: #ffd76a; font-weight: 600; line-height: 1.3; white-space: nowrap;
			}
			.dsh-income-total {
				font-size: 17px; font-weight: 800; color: #ffe9a8; line-height: 1.3;
				font-variant-numeric: tabular-nums; white-space: nowrap;
				text-shadow: 0 0 12px rgba(255,200,60,.45);
			}
			@keyframes dsh-income-in {
				0%   { opacity: 0; transform: translateY(8px) scale(.95); }
				100% { opacity: 1; transform: translateY(0) scale(1); }
			}
		`;

		// Rough per-second income estimates based on public net-worth figures.
		// Avatars are Wikipedia portrait thumbnails (hotlink-friendly).
		const PEOPLE = [
			{ id: "musk", name: { zh: "埃隆·马斯克", en: "Elon Musk" }, perSec: 2700, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elon_Musk_-_54820081119_%28cropped%29.jpg/330px-Elon_Musk_-_54820081119_%28cropped%29.jpg" },
			{ id: "trump", name: { zh: "唐纳德·特朗普", en: "Donald Trump" }, perSec: 40, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg/330px-Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg" },
			{ id: "bezos", name: { zh: "杰夫·贝索斯", en: "Jeff Bezos" }, perSec: 2500, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg/330px-260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg" },
			{ id: "gates", name: { zh: "比尔·盖茨", en: "Bill Gates" }, perSec: 1300, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg/330px-Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg" },
			{ id: "buffett", name: { zh: "沃伦·巴菲特", en: "Warren Buffett" }, perSec: 800, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/330px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg" },
			{ id: "zuckerberg", name: { zh: "马克·扎克伯格", en: "Mark Zuckerberg" }, perSec: 2000, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/F20250904AH-2824_%2854778373111%29_%283x4_cropped_on_Zuckerberg_following_the_rule_of_thirds%29.jpg/330px-F20250904AH-2824_%2854778373111%29_%283x4_cropped_on_Zuckerberg_following_the_rule_of_thirds%29.jpg" },
			{ id: "huang", name: { zh: "黄仁勋", en: "Jensen Huang" }, perSec: 2900, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jen-Hsun_Huang_2025.jpg/330px-Jen-Hsun_Huang_2025.jpg" },
			{ id: "ma", name: { zh: "马云", en: "Jack Ma" }, perSec: 300, avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/20th_Anniversary_Schwab_Foundation_Gala_Dinner_%2844887783681%29_%28cropped%29.jpg/330px-20th_Anniversary_Schwab_Foundation_Gala_Dinner_%2844887783681%29_%28cropped%29.jpg" }
		];

		/** Bottom-right per-second income card for one well-known person. */
		function MoneyCounter() {
			const [localeId, setLocaleId] = react.useState("zh");
			const [index, setIndex] = react.useState(0);
			const [startAt, setStartAt] = react.useState(() => Date.now());
			const [now, setNow] = react.useState(() => Date.now());
			const [imgErr, setImgErr] = react.useState(false);

			react.useEffect(() => {
				const locale = ctx.get("locale");
				if (locale === undefined) return;
				setLocaleId(locale.getLocale().active);
				return locale.subscribe(() => setLocaleId(locale.getLocale().active));
			}, []);

			react.useEffect(() => {
				const timer = window.setInterval(() => setNow(Date.now()), 100);
				return () => window.clearInterval(timer);
			}, []);

			react.useEffect(() => {
				const timer = window.setInterval(() => {
					setIndex((i) => (i + 1) % PEOPLE.length);
					setStartAt(Date.now());
					setImgErr(false);
				}, 8000);
				return () => window.clearInterval(timer);
			}, []);

			const person = PEOPLE[index];
			const elapsed = Math.max(0, (now - startAt) / 1000);
			const total = elapsed * person.perSec;
			const fmt = (n) => n.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			const rate = person.perSec.toLocaleString("en-US");
			const zh = localeId === "zh";
			const name = person.name[zh ? "zh" : "en"];
			const sub = person.name[zh ? "en" : "zh"];
			const initial = (sub || name).charAt(0).toUpperCase();
			const avatar = imgErr
				? react.createElement("div", { className: "dsh-income-avatar" }, initial)
				: react.createElement("img", {
					className: "dsh-income-avatar",
					src: person.avatar,
					alt: name,
					onError: () => setImgErr(true)
				});

			return react.createElement("div", { className: "dsh-income" },
				react.createElement("div", {
					className: "dsh-income-card",
					key: person.id,
					title: zh ? "点击切换人物" : "Click to switch person",
					onClick: () => {
						setIndex((i) => (i + 1) % PEOPLE.length);
						setStartAt(Date.now());
						setImgErr(false);
					}
				},
					avatar,
					react.createElement("div", { className: "dsh-income-body" },
						react.createElement("div", { className: "dsh-income-name" }, name),
						react.createElement("div", { className: "dsh-income-sub" }, sub),
						react.createElement("div", { className: "dsh-income-rate" },
							zh ? "每秒收入 ≈ $" + rate : "per second ≈ $" + rate
						),
						react.createElement("div", { className: "dsh-income-total" },
							(zh ? "已入账 $" : "earned $") + fmt(total)
						)
					)
				)
			);
		}
		//#endregion

		/** Required services: overlay registration and active-locale reading. */
		const inject = ["slots", "locale"];

		/** Client plugin body: register the bottom-right overlay entry. */
		function apply(ctx) {
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "money-counter",
				order: 100,
				label: "\u6BCF\u79D2\u6536\u5165"
			}, MoneyCounter));
		}

		exports.MoneyCounter = MoneyCounter;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

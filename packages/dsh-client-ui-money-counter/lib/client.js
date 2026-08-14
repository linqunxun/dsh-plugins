// Browser half of the money-counter plugin, packaged in the client bundle
// format the web app serves at /plugins/<id>/client.js.
window.__ModuleLoader__.load({
	id: "dsh-client-ui-money-counter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");

		//#region money-counter component
		const CSS = `
			.dsh-money {
				position: fixed; right: 22px; bottom: 22px; z-index: 9999;
				pointer-events: none; user-select: none;
				display: flex; flex-direction: column; align-items: flex-end;
			}
			.dsh-money-pill {
				display: flex; align-items: center; gap: 8px;
				padding: 10px 16px; border-radius: 999px;
				background: linear-gradient(135deg, rgba(22,22,30,.94), rgba(34,30,20,.94));
				border: 1px solid rgba(255,200,60,.55);
				box-shadow: 0 0 18px rgba(255,190,40,.35), 0 6px 20px rgba(0,0,0,.35);
				backdrop-filter: blur(8px);
				animation: dsh-money-glow 2.2s ease-in-out infinite;
			}
			.dsh-money-coin { font-size: 20px; animation: dsh-money-bounce 1.6s ease-in-out infinite; }
			.dsh-money-num {
				font-size: 18px; font-weight: 700; letter-spacing: .5px;
				color: #ffd76a; font-variant-numeric: tabular-nums;
				text-shadow: 0 0 12px rgba(255,200,60,.6);
			}
			.dsh-money-tag { font-size: 11px; color: rgba(255,255,255,.72); letter-spacing: 1px; }
			.dsh-money-p {
				position: absolute; bottom: 46px; left: 50%;
				font-size: 14px; font-weight: 700; color: #ffd76a;
				text-shadow: 0 1px 4px rgba(0,0,0,.5);
				white-space: nowrap; opacity: 0;
				animation: dsh-money-float 1.5s ease-out forwards;
			}
			@keyframes dsh-money-float {
				0%   { opacity: 0; transform: translate(-50%, 0) scale(.85); }
				18%  { opacity: 1; }
				100% { opacity: 0; transform: translate(-50%, -92px) scale(1.08); }
			}
			@keyframes dsh-money-bounce {
				0%, 100% { transform: translateY(0); }
				50%      { transform: translateY(-4px); }
			}
			@keyframes dsh-money-glow {
				0%, 100% { box-shadow: 0 0 14px rgba(255,190,40,.3), 0 6px 20px rgba(0,0,0,.35); }
				50%      { box-shadow: 0 0 26px rgba(255,200,60,.6), 0 6px 22px rgba(0,0,0,.35); }
			}
		`;

		/** Bottom-right money counter: balance climbs continuously, +¥ particles float up. */
		function MoneyCounter() {
			const [money, setMoney] = react.useState(128888.66);
			const [particles, setParticles] = react.useState([]);
			const seq = react.useRef(0);
			react.useEffect(() => {
				const timer = window.setInterval(() => {
					setMoney((m) => m + (Math.random() * 40 + 8));
				}, 90);
				return () => window.clearInterval(timer);
			}, []);
			react.useEffect(() => {
				const timer = window.setInterval(() => {
					const id = ++seq.current;
					const amt = (Math.random() * 18 + 2).toFixed(2);
					const dx = Math.round(Math.random() * 60 - 30);
					setParticles((ps) => [...ps.slice(-7), { id, amt, dx }]);
					window.setTimeout(() => {
						setParticles((ps) => ps.filter((p) => p.id !== id));
					}, 1600);
				}, 430);
				return () => window.clearInterval(timer);
			}, []);
			const text = money.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			return react.createElement("div", { className: "dsh-money" },
				react.createElement("style", null, CSS),
				particles.map((p) => react.createElement("div", {
					key: p.id,
					className: "dsh-money-p",
					style: { marginLeft: p.dx + "px" }
				}, "+" + p.amt)),
				react.createElement("div", { className: "dsh-money-pill" },
					react.createElement("span", { className: "dsh-money-coin" }, "\uD83E\uDE99"),
					react.createElement("span", { className: "dsh-money-num" }, "\u00A5 " + text),
					react.createElement("span", { className: "dsh-money-tag" }, "\u6301\u7EED\u5165\u8D26")
				)
			);
		}
		//#endregion

		/** Required services for the overlay registration. */
		const inject = ["slots"];

		/** Client plugin body: register the bottom-right overlay entry. */
		function apply(ctx) {
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "money-counter",
				order: 100,
				label: "\u91D1\u94B1\u52A8\u6548"
			}, MoneyCounter));
		}

		exports.MoneyCounter = MoneyCounter;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

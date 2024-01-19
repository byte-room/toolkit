import {useTranslation} from "react-i18next";
import {TRANSLATOR_NAME} from "@/modules/ai/translator/tool";
import {MODULE_NAME} from "@/modules/ai/consts";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {useGlobalDialog} from "@/components/dialog";
import {ModelSelect} from "@/modules/ai/translator/ModelSelect";
import {Loader2, SettingsIcon} from "lucide-react";
import translator, {Language} from "@/modules/ai/translator/providers";
import {useLocalState} from "@/hooks/state";

export function TranslatePage() {
	const [text, setText] = useLocalState<string>(TRANSLATOR_NAME + ".text", "")
	const [resText, setResText] = useState<string>("")
	const [providers, setProviders] = useState(translator.getProviders())
	const items = providers.map(p => ({label: p.label, value: p.name}))
	const [provider, setProvider] = useState<string>(items[0]?.value ?? "")
	const [langs, setLangs] = useState<Language[]>([])
	const [from, setFrom] = useState("")
	const [to, setTo] = useState("")
	const [loading, setLoading] = useState(false)

	const {t} = useTranslation(MODULE_NAME)
	const {show} = useGlobalDialog()

	const handleTranslate = async () => {
		setLoading(true)
		try {
			const res = await translator.translate(provider, {
				text: text,
				from: from,
				to: to,
				callback: (text) => {
					setResText(text)
				}
			})
			setResText(res)
		} finally {
			setLoading(false)
		}
	}

	const handleSettings = () => {
		show({
			title: "test",
			content: "test content"
		})
	}

	useEffect(() => {
		if (provider) {
			translator.getLanguages(provider).then(res => {
				setLangs(res.toLang)
				const deTo = res.toLang.find(l => l.value === res.defaultTo)
				setTo(deTo?.value ?? "")
				const deFrom = res.fromLang?.find(l => l.value === res.defaultFrom)
				setFrom(deFrom?.value ?? "")
			})
		} else {
			setLangs([])
		}
	}, [provider])

	return (<div className="flex flex-col gap-2 h-full">
		<div className="text-xl">{t(TRANSLATOR_NAME)}</div>
		<div className="flex flex-wrap gap-2 items-center">
			<span className="flex-1">{t("Input text")}:</span>
			{t("Model")}:
			<ModelSelect width="160px"
			             items={items}
			             value={provider}
			             disableSearch
			             onChange={m => {
				             setProvider(m)
			             }}/>
			<Button variant="secondary" onClick={handleSettings}><SettingsIcon className="mr-1 h-4 w-4"/>
				{t("Setting")}
			</Button>
		</div>
		<Textarea rows={8} defaultValue={text}
		          onChange={(e) => setText(e.target.value)}
		/>

		<div className="flex items-center gap-2">
			{t("From")}:
			<ModelSelect width="160px" items={langs} value={from} onChange={m => {
				setFrom(m)
			}}/>
			{t("To")}:
			<ModelSelect width="160px" items={langs} value={to} onChange={m => {
				setTo(m)
			}}/>
			<div className="flex-1"></div>
			<Button className="w-[200px]" variant="secondary" disabled={!text || loading || !to || !provider}
			        onClick={handleTranslate}>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
				{t("translate")}
			</Button>
		</div>
		<div className="pt-4">{t("Result")}:</div>
		<Textarea defaultValue={resText} rows={10} readOnly={true}
		          className="flex-[1] border-2 p-2 rounded-sm"></Textarea>
	</div>)
}
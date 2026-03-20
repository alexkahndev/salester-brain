import { useSpring, animated, config } from '@react-spring/web';
import {
	useState,
	useRef,
	useEffect,
	useCallback,
	type CSSProperties,
	type FormEvent
} from 'react';

import {
	HEX_B_END,
	HEX_G_END,
	HEX_RADIX,
	HEX_R_END,
	MEMORY_BASE_INCREMENT,
	MEMORY_RANDOM_FACTOR,
	RESPONSE_DELAY_BASE,
	RESPONSE_DELAY_RANGE,
	THINKING_DELAY_BASE,
	THINKING_DELAY_RANGE
} from '../../../constants';
import { AI_RESPONSES, type ChatState, type Message } from './utils';

type MessageBubbleProps = {
	accentRgb: string;
	message: Message;
};

type Props = {
	accentColor: string;
	chatState: ChatState;
	onChatStateChange: (state: ChatState) => void;
	onMemoryAdd: (count: number) => void;
	open: boolean;
};

const getStatusText = (state: ChatState) => {
	if (state === 'thinking') {
		return 'Processing...';
	}
	if (state === 'responding') {
		return 'Responding...';
	}

	return 'Online';
};

const hexToRgb = (hex: string) => {
	const cleaned = hex.replace('#', '');
	const red = parseInt(cleaned.slice(0, HEX_R_END), HEX_RADIX);
	const green = parseInt(cleaned.slice(HEX_R_END, HEX_G_END), HEX_RADIX);
	const blue = parseInt(cleaned.slice(HEX_G_END, HEX_B_END), HEX_RADIX);

	return `${red}, ${green}, ${blue}`;
};

const MessageBubble = ({ accentRgb, message }: MessageBubbleProps) => (
	<article className={`chat-message ${message.role}`}>
		<div
			className="message-bubble"
			style={
				message.role === 'user'
					? { background: `rgba(${accentRgb}, 0.15)` }
					: undefined
			}
		>
			{message.content}
		</div>
	</article>
);

export const ChatPanel = ({
	accentColor,
	chatState,
	onChatStateChange,
	onMemoryAdd,
	open
}: Props) => {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<Message[]>([
		{
			content:
				'Hello! I am the Salester Brain. Ask me anything to see me think.',
			id: '0',
			role: 'assistant',
			timestamp: Date.now()
		}
	]);
	const scrollRef = useRef<HTMLDivElement>(null);

	const panelSpring = useSpring({
		config: config.gentle,
		opacity: open ? 1 : 0,
		transform: open ? 'translateX(0%)' : 'translateX(110%)'
	});

	// Mobile bottom sheet
	const sheetSpring = useSpring({
		config: config.gentle,
		opacity: open ? 1 : 0,
		transform: open ? 'translateY(0%)' : 'translateY(110%)'
	});

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, chatState]);

	const sendMessage = useCallback(
		(text: string) => {
			setMessages((prev) => [
				...prev,
				{
					content: text,
					id: String(Date.now()),
					role: 'user',
					timestamp: Date.now()
				}
			]);
			onChatStateChange('thinking');

			setTimeout(
				() => {
					onChatStateChange('responding');
					setTimeout(
						() => {
							const response =
								AI_RESPONSES[
									Math.floor(
										Math.random() * AI_RESPONSES.length
									)
								];
							if (response) {
								setMessages((prev) => [
									...prev,
									{
										content: response,
										id: String(Date.now()),
										role: 'assistant' as const,
										timestamp: Date.now()
									}
								]);
							}
							onMemoryAdd(
								Math.floor(
									Math.random() * MEMORY_RANDOM_FACTOR
								) + MEMORY_BASE_INCREMENT
							);
							onChatStateChange('idle');
						},
						RESPONSE_DELAY_BASE +
							Math.random() * RESPONSE_DELAY_RANGE
					);
				},
				THINKING_DELAY_BASE + Math.random() * THINKING_DELAY_RANGE
			);
		},
		[onChatStateChange, onMemoryAdd]
	);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		if (input.trim() && chatState === 'idle') {
			sendMessage(input.trim());
			setInput('');
		}
	};

	const accentRgb = hexToRgb(accentColor);
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const accentStyle = {
		'--chat-accent': accentColor,
		'--chat-accent-rgb': accentRgb
	} as CSSProperties;

	const content = (
		<>
			<div className="chat-header">
				<div className="chat-status">
					<span
						className={`status-dot ${chatState}`}
						style={{
							background:
								chatState === 'idle' ? '#4caf50' : accentColor
						}}
					/>
					<span className="status-text">
						{getStatusText(chatState)}
					</span>
				</div>
				<h3>Salester Brain</h3>
			</div>

			<div className="chat-messages" ref={scrollRef}>
				{messages.map((msg) => (
					<MessageBubble
						accentRgb={accentRgb}
						key={msg.id}
						message={msg}
					/>
				))}
				{chatState === 'thinking' && (
					<article className="chat-message assistant">
						<div className="message-bubble typing">
							<span
								className="dot"
								style={{ background: accentColor }}
							/>
							<span
								className="dot"
								style={{ background: accentColor }}
							/>
							<span
								className="dot"
								style={{ background: accentColor }}
							/>
						</div>
					</article>
				)}
			</div>

			<form className="chat-input" onSubmit={handleSubmit}>
				<input
					disabled={chatState !== 'idle'}
					onChange={(evt) => setInput(evt.target.value)}
					placeholder="Ask the brain something..."
					style={{ borderColor: input ? accentColor : undefined }}
					type="text"
					value={input}
				/>
				<button
					disabled={chatState !== 'idle' || !input.trim()}
					style={{
						background: `rgba(${accentRgb}, 0.15)`,
						borderColor: `rgba(${accentRgb}, 0.3)`,
						color: accentColor
					}}
					type="submit"
				>
					Send
				</button>
			</form>
		</>
	);

	return (
		<>
			{/* Desktop/tablet: side panel */}
			<animated.div
				className="chat-panel chat-panel--side"
				style={{ ...panelSpring, ...accentStyle }}
			>
				{content}
			</animated.div>

			{/* Mobile: bottom sheet */}
			<animated.div
				className="chat-panel chat-panel--bottom"
				style={{ ...sheetSpring, ...accentStyle }}
			>
				{content}
			</animated.div>
		</>
	);
};

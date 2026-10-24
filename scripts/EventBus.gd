extends Node

## EventBus — Barramento Global de Eventos (Godot 4.7.2 / GDScript 2.0)
## Toda comunicação entre jogador, armadilhas, partículas e UI passa por aqui.

# ── Gameplay ──────────────────────────────────────────────────────
signal score_updated(new_score: int)
signal health_updated(current: int, maximum: int)
signal player_died()
signal level_completed(level_index: int, stars_count: int)
signal checkpoint_reached(checkpoint_id: int)
signal quantum_bit_collected(total_bits: int)

# ── UI e Menus ────────────────────────────────────────────────────
signal hud_show_message(text: String, duration: float)
signal pause_requested()
signal resume_requested()

# ── Áudio ─────────────────────────────────────────────────────────
signal play_sfx(sfx_name: String)
signal play_music(track_name: String)
signal mute_toggled(is_muted: bool)

# ── Polish & Game Feel ────────────────────────────────────────────
signal stars_earned(level_index: int, star_count: int)
signal haptic_requested(duration_ms: int)
signal screen_shake_requested(trauma_amount: float)
signal pacing_adjusted(new_coyote_time: float)

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

func limpar_conexoes_ativas() -> void:
	var sinais: Array[Signal] = [
		score_updated, health_updated, player_died,
		level_completed, checkpoint_reached, quantum_bit_collected,
		hud_show_message, stars_earned, haptic_requested,
		screen_shake_requested, pacing_adjusted
	]
	for sig in sinais:
		for conn in sig.get_connections():
			sig.disconnect(conn.callable)

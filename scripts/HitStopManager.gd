extends Node
class_name HitStopManager

## HitStopManager — Micro-congelamento de Impacto (Hit-Stop de 40ms a 70ms) (Godot 4.7.2)
## Fornece sensação de peso e feedback tátil em impactos críticos e mortes

static var is_hit_stopped: bool = false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

static func trigger(tree: SceneTree, duration_ms: int = 50) -> void:
	if is_hit_stopped:
		return
	is_hit_stopped = true
	var orig_scale := Engine.time_scale
	Engine.time_scale = 0.05
	
	var timer := tree.create_timer(float(duration_ms) / 1000.0 * 0.05, true, false, true)
	timer.timeout.connect(func():
		Engine.time_scale = orig_scale
		is_hit_stopped = false
	)

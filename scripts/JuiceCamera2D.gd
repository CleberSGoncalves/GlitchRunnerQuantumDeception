extends Camera2D
class_name JuiceCamera2D

## JuiceCamera2D — Câmera com Trauma² Screen Shake Exponencial e Damping (Godot 4.7.2)
## Implementa a regra física Trauma^2: trauma entre 0.0 e 1.0 elevado ao quadrado.

@export var decay: float = 1.6
@export var max_offset: Vector2 = Vector2(24, 18)
@export var max_roll: float = 0.06
@export var follow_target: Node2D = null
@export var follow_smooth_speed: float = 8.0

var trauma: float = 0.0
var trauma_power: int = 2
var noise: FastNoiseLite = null
var noise_y: float = 0.0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	noise = FastNoiseLite.new()
	noise.seed = randi()
	noise.frequency = 4.0
	EventBus.haptic_requested.connect(_on_haptic_requested)

func add_trauma(amount: float) -> void:
	trauma = clamp(trauma + amount, 0.0, 1.0)

func _process(delta: float) -> void:
	# Segue o alvo suavemente
	if follow_target and is_instance_valid(follow_target):
		global_position = global_position.lerp(follow_target.global_position, follow_smooth_speed * delta)

	# Atualiza o Trauma² Screen Shake
	if trauma > 0.0:
		trauma = max(0.0, trauma - decay * delta)
		var shake := pow(trauma, trauma_power)
		noise_y += delta * 60.0
		rotation = max_roll * shake * noise.get_noise_2d(0.0, noise_y)
		offset.x = max_offset.x * shake * noise.get_noise_2d(100.0, noise_y)
		offset.y = max_offset.y * shake * noise.get_noise_2d(200.0, noise_y)
	else:
		offset = Vector2.ZERO
		rotation = 0.0

func _on_haptic_requested(duration_ms: int) -> void:
	add_trauma(clamp(float(duration_ms) / 100.0, 0.2, 0.8))

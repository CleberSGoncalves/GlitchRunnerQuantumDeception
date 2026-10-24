extends Node
class_name SquashStretch2D

## SquashStretch2D — Deformação Elástica Procedural (Godot 4.7.2)
## Aplica squash ao aterrissar e stretch ao pular com amortecimento harmônico.

@export var target_node: Node2D = null
@export var return_speed: float = 12.0
@export var spring_stiffness: float = 180.0
@export var damping: float = 14.0

var current_scale: Vector2 = Vector2.ONE
var target_scale: Vector2 = Vector2.ONE
var velocity: Vector2 = Vector2.ZERO

func _ready() -> void:
	if not target_node and get_parent() is Node2D:
		target_node = get_parent() as Node2D

func apply_stretch(stretch_y: float = 1.3, squash_x: float = 0.8) -> void:
	current_scale = Vector2(squash_x, stretch_y)

func apply_squash(squash_y: float = 0.7, stretch_x: float = 1.35) -> void:
	current_scale = Vector2(stretch_x, squash_y)

func _process(delta: float) -> void:
	if not target_node:
		return

	# Amortecedor harmônico suave (Spring-Damper)
	var displacement := current_scale - target_scale
	var force := -spring_stiffness * displacement - damping * velocity
	velocity += force * delta
	current_scale += velocity * delta

	# Guard anti-NaN
	if is_nan(current_scale.x) or is_nan(current_scale.y):
		current_scale = Vector2.ONE
		velocity = Vector2.ZERO

	target_node.scale = current_scale

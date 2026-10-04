package expo.modules.hapticengine

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class HapticEvent : Record {
  @Field val type: String = "transient"
  @Field val time: Double = 0.0
  @Field val duration: Double = 0.1
  @Field val intensity: Double = 1.0
  @Field val endIntensity: Double? = null
  @Field val sharpness: Double = 0.5
}

class HapticEngineModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val vibrator: Vibrator by lazy {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
      (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    else @Suppress("DEPRECATION") (context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator)
  }

  override fun definition() = ModuleDefinition {
    Name("HapticEngine")

    Function("isSupported") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && vibrator.hasVibrator()
    }

    Function("play") { events: List<HapticEvent> ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || events.isEmpty()) return@Function
      val (timings, amps) = render(events, vibrator.hasAmplitudeControl())
      vibrator.cancel()
      val effect = if (vibrator.hasAmplitudeControl())
        VibrationEffect.createWaveform(timings, amps, -1)
      else VibrationEffect.createWaveform(timings, -1)
      vibrator.vibrate(effect)
    }

    Function("cancel") { vibrator.cancel() }
  }

  private fun render(events: List<HapticEvent>, hasAmp: Boolean): Pair<LongArray, IntArray> {
    val step = 10L
    val transientMs = 20L // motors need ~20ms to spin up; shorter pulses barely register
    val endMs = events.maxOf {
      (it.time * 1000).toLong() + if (it.type == "continuous") (it.duration * 1000).toLong() else transientMs
    }
    val buf = IntArray((endMs / step).toInt() + 1)

    for (e in events) {
      val start = (e.time * 1000).toLong()
      val dur = if (e.type == "continuous") (e.duration * 1000).toLong() else transientMs
      val a0 = e.intensity
      val a1 = e.endIntensity ?: e.intensity
      var t = 0L
      while (t < dur) {
        val f = if (dur > 0) t.toDouble() / dur else 0.0
        val amp = ((a0 + (a1 - a0) * f) * 255).toInt().coerceIn(1, 255)
        val i = ((start + t) / step).toInt().coerceAtMost(buf.size - 1)
        buf[i] = maxOf(buf[i], amp)
        t += step
      }
    }

    // merge equal neighbours into (duration, amplitude) runs
    val timings = ArrayList<Long>()
    val amps = ArrayList<Int>()
    var i = 0
    while (i < buf.size) {
      var j = i
      while (j < buf.size && buf[j] == buf[i]) j++
      timings.add((j - i) * step)
      amps.add(if (!hasAmp && buf[i] > 0) 255 else buf[i])
      i = j
    }
    return timings.toLongArray() to amps.toIntArray()
  }
}
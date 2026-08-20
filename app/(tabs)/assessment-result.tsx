import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const PURPLE = "#3F2A88";
const SELF_COLOR = "#4169E1";
const ASSESSOR_COLOR = "#E0A11B";
const MAX_SCORE = 5;

type Point = {
  x: number;
  y: number;
};

type LineSegmentProps = {
  color: string;
  from: Point;
  thickness?: number;
  to: Point;
};

type RadarSeriesProps = {
  center: Point;
  color: string;
  radius: number;
  scores: number[];
};

const selfScores = [4.6, 4.1, 4.0, 4.1];
const assessorScores = [4.2, 4.4, 3.7, 3.7];

function pointForScore(
  center: Point,
  radius: number,
  axisIndex: number,
  score: number,
) {
  const angle = -Math.PI / 2 + axisIndex * (Math.PI / 2);
  const distance = radius * (score / MAX_SCORE);

  return {
    x: center.x + Math.cos(angle) * distance,
    y: center.y + Math.sin(angle) * distance,
  };
}

function LineSegment({ color, from, thickness = 1, to }: LineSegmentProps) {
  const xDistance = to.x - from.x;
  const yDistance = to.y - from.y;
  const length = Math.sqrt(xDistance ** 2 + yDistance ** 2);
  const angle = (Math.atan2(yDistance, xDistance) * 180) / Math.PI;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.lineSegment,
        {
          backgroundColor: color,
          height: thickness,
          left: (from.x + to.x) / 2 - length / 2,
          top: (from.y + to.y) / 2 - thickness / 2,
          transform: [{ rotate: `${angle}deg` }],
          width: length,
        },
      ]}
    />
  );
}

function RadarSeries({ center, color, radius, scores }: RadarSeriesProps) {
  const points = scores.map((score, index) =>
    pointForScore(center, radius, index, score),
  );

  return (
    <>
      {points.map((point, index) => (
        <LineSegment
          color={color}
          from={point}
          key={`${color}-line-${index}`}
          thickness={3}
          to={points[(index + 1) % points.length]}
        />
      ))}

      {points.map((point, index) => (
        <View
          key={`${color}-point-${index}`}
          style={[
            styles.dataPoint,
            {
              backgroundColor: color,
              left: point.x - 5,
              top: point.y - 5,
            },
          ]}
        />
      ))}
    </>
  );
}

function RadarChart({ size }: { size: number }) {
  const center = { x: size / 2, y: size / 2 };
  const radius = size * 0.29;

  const outerPoints = [0, 1, 2, 3].map((axisIndex) =>
    pointForScore(center, radius, axisIndex, MAX_SCORE),
  );

  return (
    <View
      accessibilityLabel="Radar chart. Your average score is 4.2 out of 5 and your assessor's average score is 4.0 out of 5."
      accessibilityRole="image"
      style={[styles.chart, { height: size, width: size }]}
    >
      {[0.25, 0.5, 0.75, 1].map((level) => {
        const levelPoints = [0, 1, 2, 3].map((axisIndex) =>
          pointForScore(center, radius, axisIndex, MAX_SCORE * level),
        );

        return levelPoints.map((point, index) => (
          <LineSegment
            color={level === 1 ? "#AAA6B3" : "#DDD9E4"}
            from={point}
            key={`grid-${level}-${index}`}
            to={levelPoints[(index + 1) % levelPoints.length]}
          />
        ));
      })}

      {outerPoints.map((point, index) => (
        <LineSegment
          color="#D4D0DA"
          from={center}
          key={`axis-${index}`}
          to={point}
        />
      ))}

      <RadarSeries
        center={center}
        color={ASSESSOR_COLOR}
        radius={radius}
        scores={assessorScores}
      />

      <RadarSeries
        center={center}
        color={SELF_COLOR}
        radius={radius}
        scores={selfScores}
      />

      <Text style={[styles.chartLabel, styles.topLabel]}>Communication</Text>

      <Text style={[styles.chartLabel, styles.rightLabel]}>Collaboration</Text>

      <Text style={[styles.chartLabel, styles.bottomLabel]}>
        Critical thinking
      </Text>

      <Text style={[styles.chartLabel, styles.leftLabel]}>Contribution</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function ScoreCard({
  color,
  icon,
  label,
  score,
}: {
  color: string;
  icon: "person-outline" | "briefcase-outline";
  label: string;
  score: string;
}) {
  return (
    <View style={styles.scoreCard}>
      <View style={[styles.scoreIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>

      <View>
        <Text style={styles.scoreLabel}>{label}</Text>

        <Text style={[styles.scoreValue, { color }]}>
          {score}
          <Text style={styles.scoreMaximum}> / 5</Text>
        </Text>
      </View>
    </View>
  );
}

export default function AssessmentResultScreen() {
  const { width } = useWindowDimensions();
  const chartSize = Math.min(width - 40, 350);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.heading}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowLine} />

            <Text style={styles.eyebrow}>SPRINT 2 · ASSESSED</Text>
          </View>

          <Text style={styles.title}>Assessment Result</Text>

          <Text style={styles.subtitle}>
            See how you and your assessor rated your performance.
          </Text>
        </View>

        <View style={styles.chartCard}>
          <RadarChart size={chartSize} />

          <View style={styles.legend}>
            <LegendItem color={SELF_COLOR} label="You" />
            <LegendItem color={ASSESSOR_COLOR} label="Assessor" />
          </View>
        </View>

        <View style={styles.scoreRow}>
          <ScoreCard
            color={SELF_COLOR}
            icon="person-outline"
            label="You"
            score="4.2"
          />

          <ScoreCard
            color={ASSESSOR_COLOR}
            icon="briefcase-outline"
            label="Assessor"
            score="4.0"
          />
        </View>

        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Assessor Feedback</Text>

          <View style={styles.feedbackCard}>
            <View style={styles.quoteIcon}>
              <Ionicons name="chatbubble-ellipses" size={20} color={PURPLE} />
            </View>

            <Text style={styles.feedbackText}>
              Well-structured reflection with thoughtful insights. Your examples
              clearly show how you collaborated with the team and responded to
              feedback throughout the sprint.
            </Text>
          </View>
        </View>

        {/* Reflection History */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/reflection-list")}
          style={({ pressed }) => [
            styles.historyButton,
            pressed && styles.historyButtonPressed,
          ]}
        >
          <Ionicons name="time-outline" size={21} color="#FFFFFF" />

          <Text style={styles.historyButtonText}>Reflection History</Text>
        </Pressable>

        {/* Back to Reflector Home */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/(tabs)/reflector-home")}
          style={({ pressed }) => [
            styles.homeButton,
            pressed && styles.homeButtonPressed,
          ]}
        >
          <Ionicons name="home-outline" size={21} color={PURPLE} />

          <Text style={styles.homeButtonText}>Back to Reflector Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6FA",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },

  content: {
    alignSelf: "center",
    maxWidth: 560,
    paddingHorizontal: 20,
    paddingTop: 28,
    width: "100%",
  },

  heading: {
    marginBottom: 20,
  },

  eyebrowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },

  eyebrowLine: {
    backgroundColor: PURPLE,
    borderRadius: 2,
    height: 3,
    width: 24,
  },

  eyebrow: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  title: {
    color: "#161221",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  subtitle: {
    color: "#6B6675",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 7,
  },

  chartCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E3EC",
    borderRadius: 22,
    borderWidth: 1,
    paddingBottom: 18,
    shadowColor: "#281F3E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  chart: {
    position: "relative",
  },

  lineSegment: {
    borderRadius: 3,
    position: "absolute",
  },

  dataPoint: {
    borderColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: "absolute",
    width: 10,
  },

  chartLabel: {
    color: "#4D4857",
    fontSize: 12,
    fontWeight: "600",
    position: "absolute",
  },

  topLabel: {
    left: 0,
    textAlign: "center",
    top: 13,
    width: "100%",
  },

  rightLabel: {
    right: 8,
    textAlign: "right",
    top: "48%",
  },

  bottomLabel: {
    bottom: 12,
    left: 0,
    textAlign: "center",
    width: "100%",
  },

  leftLabel: {
    left: 8,
    top: "48%",
  },

  legend: {
    flexDirection: "row",
    gap: 20,
  },

  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  legendDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },

  legendText: {
    color: "#5B5665",
    fontSize: 13,
    fontWeight: "600",
  },

  scoreRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  scoreCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E3EC",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 84,
    padding: 14,
  },

  scoreIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  scoreLabel: {
    color: "#6B6675",
    fontSize: 13,
    fontWeight: "600",
  },

  scoreValue: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },

  scoreMaximum: {
    color: "#8D8797",
    fontSize: 13,
    fontWeight: "600",
  },

  feedbackSection: {
    marginTop: 24,
  },

  sectionTitle: {
    color: "#161221",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  feedbackCard: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E3EC",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },

  quoteIcon: {
    alignItems: "center",
    backgroundColor: "#F0ECFF",
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  feedbackText: {
    color: "#4D4857",
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },

  historyButton: {
    alignItems: "center",
    backgroundColor: PURPLE,
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    height: 54,
    justifyContent: "center",
    marginTop: 24,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },

  historyButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  historyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  homeButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: PURPLE,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 9,
    height: 54,
    justifyContent: "center",
    marginTop: 12,
  },

  homeButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  homeButtonText: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: "700",
  },
});

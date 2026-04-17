class HealthLab {
  bmi(w, h) {
    const val = (w / Math.pow(h/100, 2)).toFixed(1);
    const cat = val < 18.5 ? 'Underweight 🍃' : val < 25 ? 'Healthy ✅' : val < 30 ? 'Overweight ⚠️' : 'Obese 🚨';
    return { val, cat, ideal: [(18.5*Math.pow(h/100,2)).toFixed(1), (24.9*Math.pow(h/100,2)).toFixed(1)] };
  }

  bmr(w, h, age, gender) {
    const raw = gender === 'female'
      ? 655 + (9.6*w) + (1.8*h) - (4.7*age)
      : 66 + (13.7*w) + (5*h) - (6.8*age);
    return Math.round(raw);
  }

  tdee(bmr, level = 'moderate') {
    const mult = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, athlete:1.9 };
    return Math.round(bmr * (mult[level] || 1.55));
  }

  macros(cals, goal = 'maintain') {
    const r = { lose:[0.40,0.35,0.25], maintain:[0.30,0.35,0.35], gain:[0.25,0.35,0.40] }[goal] || [0.3,0.35,0.35];
    return {
      protein: Math.round((cals*r[0])/4),
      fat: Math.round((cals*r[1])/9),
      carbs: Math.round((cals*r[2])/4)
    };
  }

  water(wKg) { return Math.round(wKg * 35); }

  sleepWakeUp() {
    const now = Date.now();
    return [90,180,270,360,450].map(m => {
      const d = new Date(now + m*60000);
      return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    });
  }

  hrZones(age) {
    const max = 220 - age;
    return { max, fatburn: `${Math.round(max*0.6)}-${Math.round(max*0.7)}`, cardio: `${Math.round(max*0.7)}-${Math.round(max*0.8)}`, peak: `${Math.round(max*0.8)}-${max}` };
  }

  oneRm(w, reps) { return Math.round(w * (1 + reps/30)); }

  bodyFat(gender, waist, neck, height, hip = 0) {
    let v;
    if (gender === 'male') v = 86.010*Math.log10(waist-neck) - 70.041*Math.log10(height) + 36.76;
    else v = 163.205*Math.log10(waist+hip-neck) - 97.684*Math.log10(height) - 78.387;
    return v.toFixed(1);
  }

  workout(type = 'fullbody') {
    const db = {
      fullbody: ['Push-ups 3x12', 'Squats 3x15', 'Plank 3x45s', 'Lunges 3x10/leg', 'Glute bridges 3x15'],
      hiit: ['Burpees 40s', 'Mountain climbers 40s', 'Jump squats 40s', 'High knees 40s', 'Rest 20s between'],
      abs: ['Crunches 3x20', 'Leg raises 3x15', 'Russian twists 3x30', 'Bicycle crunches 3x20', 'Plank 3x60s'],
      upper: ['Push-ups 3x15', 'Tricep dips 3x12', 'Pike push-ups 3x10', 'Superman holds 3x30s'],
      lower: ['Squats 3x20', 'Lunges 3x12', 'Calf raises 3x20', 'Wall sit 3x45s']
    };
    return db[type] || db.fullbody;
  }

  yoga(pose = 'random') {
    const poses = [
      { name: 'Downward Dog', benefit: 'Full body stretch, calms mind', time: '60s' },
      { name: 'Warrior II', benefit: 'Strengthens legs, improves focus', time: '45s/side' },
      { name: 'Child\'s Pose', benefit: 'Relieves stress, stretches back', time: '90s' },
      { name: 'Tree Pose', benefit: 'Balance and core stability', time: '45s/side' },
      { name: 'Cobra Pose', benefit: 'Opens chest, strengthens spine', time: '45s' }
    ];
    return pose === 'random' ? poses[Math.floor(Math.random()*poses.length)] : poses.find(p => p.name.toLowerCase().includes(pose.toLowerCase())) || poses[0];
  }
}

module.exports = new HealthLab();
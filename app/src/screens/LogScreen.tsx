import React, { useState } from 'react';

const LogScreen: React.FC = () => {
  const [logType, setLogType] = useState<'meal' | 'behavior'>('meal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Retrospective logging state
  const [isRetrospective, setIsRetrospective] = useState(false);
  const [retrospectiveTime, setRetrospectiveTime] = useState('');
  const [customDateTime, setCustomDateTime] = useState('');
  // Meal logging state
  const [mealType, setMealType] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [satietyPre, setSatietyPre] = useState(5);
  const [satietyPost, setSatietyPost] = useState(5);
  const [emotionPre, setEmotionPre] = useState<string[]>([]);
  const [emotionPost, setEmotionPost] = useState<string[]>([]);
  const [affectPre, setAffectPre] = useState(5);
  const [affectPost, setAffectPost] = useState(5);
  const [socialContext, setSocialContext] = useState('');
  const [locationContext, setLocationContext] = useState('');
  // Behavior logging state
  const [behaviorDescription, setBehaviorDescription] = useState('');
  const [behaviorEmotionPre, setBehaviorEmotionPre] = useState<string[]>([]);
  const [behaviorEmotionPost, setBehaviorEmotionPost] = useState<string[]>([]);
  const [behaviorAffectPre, setBehaviorAffectPre] = useState(5);
  const [behaviorAffectPost, setBehaviorAffectPost] = useState(5);

  const emotionOptions = [
    'Anxious', 'Calm', 'Excited', 'Sad', 'Happy', 'Stressed', 'Relaxed', 'Guilty',
    'Frustrated', 'Content', 'Worried', 'Confident', 'Overwhelmed', 'Peaceful'
  ];
  const mealTypeOptions = [
    'Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack', 'Late Night'
  ];
  const locationOptions = [
    'Home', 'Work', 'School', 'Restaurant', 'Cafeteria', 'Bedroom', 'Kitchen', 'Car', 'Other'
  ];
  const socialContextOptions = [
    'Alone', 'With family', 'With friends', 'With colleagues', 'In a room with others', 'On video call'
  ];
  const getAffectEmoji = (value: number) => {
    const emojis = ['😵‍💫', '😫', '😞', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥳'];
    return emojis[value - 1] || '😐';
  };
  const handleEmotionToggle = (emotion: string, isPre: boolean, isMeal: boolean) => {
    if (isMeal) {
      if (isPre) {
        setEmotionPre(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
      } else {
        setEmotionPost(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
      }
    } else {
      if (isPre) {
        setBehaviorEmotionPre(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
      } else {
        setBehaviorEmotionPost(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
      }
    }
  };
  const getEventTimestamp = () => {
    if (!isRetrospective) {
      return new Date();
    }
    if (retrospectiveTime === 'recent') {
      const now = new Date();
      return new Date(now.getTime() - 15 * 60 * 1000);
    } else if (retrospectiveTime === 'custom' && customDateTime) {
      return new Date(customDateTime);
    }
    return new Date();
  };
  const resetForm = () => {
    if (logType === 'meal') {
      setMealType('');
      setMealDescription('');
      setSatietyPre(5);
      setSatietyPost(5);
      setEmotionPre([]);
      setEmotionPost([]);
      setAffectPre(5);
      setAffectPost(5);
      setSocialContext('');
      setLocationContext('');
    } else {
      setBehaviorDescription('');
      setBehaviorEmotionPre([]);
      setBehaviorEmotionPost([]);
      setBehaviorAffectPre(5);
      setBehaviorAffectPost(5);
    }
    setIsRetrospective(false);
    setRetrospectiveTime('');
    setCustomDateTime('');
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      resetForm();
      setIsSubmitting(false);
    }, 1000);
  };
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Log Entry</h1>
        <p className="text-gray-600">Track your meals and behaviors to understand patterns</p>
      </div>
      <div className="card">
        <div className="mb-6">
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${logType === 'meal' ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
              onClick={() => setLogType('meal')}
            >
              Meal Log
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${logType === 'behavior' ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
              onClick={() => setLogType('behavior')}
            >
              Behavior Log
            </button>
          </div>
          <div className="mb-6 p-4 bg-olive-50 rounded-lg border border-olive-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">When did this happen?</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isRetrospective}
                  onChange={(e) => setIsRetrospective(e.target.checked)}
                  className="mr-2 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">Log retrospectively</span>
              </label>
            </div>
            {isRetrospective && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="retrospectiveTime"
                      value="recent"
                      checked={retrospectiveTime === 'recent'}
                      onChange={(e) => setRetrospectiveTime(e.target.value)}
                      className="mr-2 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Less than 30 minutes ago</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="retrospectiveTime"
                      value="custom"
                      checked={retrospectiveTime === 'custom'}
                      onChange={(e) => setRetrospectiveTime(e.target.value)}
                      className="mr-2 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Custom date & time</span>
                  </label>
                </div>
                {retrospectiveTime === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select date and time
                    </label>
                    <input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className="input-field"
                      max={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
              </div>
            )}
            {!isRetrospective && (
              <p className="text-sm text-gray-600">Logging for current time</p>
            )}
          </div>
          {logType === 'meal' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  className="input-field"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="">Select meal type</option>
                  {mealTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What did you eat and how did you feel?
                </label>
                <textarea
                  className="textarea-field"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="Describe your meal, how it made you feel, any thoughts you had, and any additional reflections..."
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-olive-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Before Eating</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How hungry were you?
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">1</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={satietyPre}
                          onChange={(e) => setSatietyPre(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-olive-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">10</span>
                        <span className="text-lg ml-2 font-medium text-primary-600">{satietyPre}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How were you feeling emotionally?
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {emotionOptions.map(emotion => (
                          <button
                            key={emotion}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${emotionPre.includes(emotion) ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
                            onClick={() => handleEmotionToggle(emotion, true, true)}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How was your general affect?
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">😵‍💫</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={affectPre}
                          onChange={(e) => setAffectPre(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-olive-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">🥳</span>
                        <span className="text-lg ml-2">{getAffectEmoji(affectPre)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">After Eating</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How satiated were you?
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">1</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={satietyPost}
                          onChange={(e) => setSatietyPost(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-olive-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">10</span>
                        <span className="text-lg ml-2 font-medium text-primary-600">{satietyPost}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How are you feeling emotionally now?
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {emotionOptions.map(emotion => (
                          <button
                            key={emotion}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${emotionPost.includes(emotion) ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
                            onClick={() => handleEmotionToggle(emotion, false, true)}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How is your general affect now?
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">😵‍💫</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={affectPost}
                          onChange={(e) => setAffectPost(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-olive-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">🥳</span>
                        <span className="text-lg ml-2">{getAffectEmoji(affectPost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    className="input-field"
                    value={locationContext}
                    onChange={(e) => setLocationContext(e.target.value)}
                  >
                    <option value="">Select location</option>
                    {locationOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Context
                  </label>
                  <select
                    className="input-field"
                    value={socialContext}
                    onChange={(e) => setSocialContext(e.target.value)}
                  >
                    <option value="">Select context</option>
                    {socialContextOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What behavior occurred and how did you feel?
                </label>
                <textarea
                  className="textarea-field"
                  value={behaviorDescription}
                  onChange={(e) => setBehaviorDescription(e.target.value)}
                  placeholder="Describe what happened, what triggered it, how you felt, and any additional reflections..."
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-olive-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Before the Behavior</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How were you feeling emotionally?
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {emotionOptions.map(emotion => (
                          <button
                            key={emotion}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${behaviorEmotionPre.includes(emotion) ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
                            onClick={() => handleEmotionToggle(emotion, true, false)}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How was your general affect?
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">😵‍💫</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={behaviorAffectPre}
                          onChange={(e) => setBehaviorAffectPre(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-olive-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">🥳</span>
                        <span className="text-lg ml-2">{getAffectEmoji(behaviorAffectPre)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">After the Behavior</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How are you feeling emotionally now?
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {emotionOptions.map(emotion => (
                          <button
                            key={emotion}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${behaviorEmotionPost.includes(emotion) ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
                            onClick={() => handleEmotionToggle(emotion, false, false)}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How is your general affect now?
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">😵‍💫</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={behaviorAffectPost}
                          onChange={(e) => setBehaviorAffectPost(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-olive-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">🥳</span>
                        <span className="text-lg ml-2">{getAffectEmoji(behaviorAffectPost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-8">
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (logType === 'meal'
                ? !mealType || !mealDescription.trim()
                : !behaviorDescription.trim())
            }
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogScreen; 
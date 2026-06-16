import type {Locale} from '@/i18n/routing';

// Hardcoded, bilingual love-letter content for the sections below the hero.
// Arabic is the polished, first-class copy; English is a faithful translation
// so /en still reads well. (Hero title/message come from the SecretPage row.)

export function getLetterContent(locale: Locale) {
  const ar = locale === 'ar';

  return {
    moment: {
      title: ar ? 'اللحظة اللي ما نسيتها' : 'The moment I never forgot',
      lines: ar
        ? [
            'يوم قلتي لي إن حلمك تفتحين بوتيك ورد، يمكن قلتيها ببساطة… بس أنا علقت معي.',
            'لأن بعض الأحلام لما تطلع من شخص يشبهك، تصير تستحق تنبني وردة وردة.'
          ]
        : [
            'The day you told me your dream was to open a flower boutique — maybe you said it simply… but it stayed with me.',
            'Because some dreams, when they come from someone like you, deserve to be built petal by petal.'
          ]
    },

    world: {
      title: ar ? 'هذا العالم يشبهك' : 'This world is made from you',
      traits: ar
        ? [
            {label: 'ناعمة'},
            {label: 'كيوت'},
            {label: 'فنانة', copy: 'لأنك تشوفين الجمال في التفاصيل الصغيرة.'},
            {label: 'ديفا', copy: 'لأن الورد يحتاج شوية دراما.'},
            {label: 'ورديّة'},
            {label: 'حساسة'},
            {label: 'درامية شوي'},
            {label: 'أميرة', copy: 'لأن هذا المكان معمول لكِ.'}
          ]
        : [
            {label: 'Soft'},
            {label: 'Cute'},
            {label: 'Artist', copy: 'Because you see the beauty in the smallest details.'},
            {label: 'Diva', copy: 'Because flowers need a little drama.'},
            {label: 'Pink'},
            {label: 'Tender'},
            {label: 'A little dramatic'},
            {label: 'Princess', copy: 'Because this place was made for you.'}
          ]
    },

    flowers: {
      title: ar ? 'وردك المفضل صار جزء من ريماسيا' : 'Your favorite flowers became part of Remasia',
      items: ar
        ? [
            {seed: 'lily', name: 'الليلي', copy: 'لأنها ناعمة وملكية مثلك.'},
            {seed: 'peony', name: 'البيوني', copy: 'لأنها وردة تحسها أميرة.'},
            {seed: 'rose', name: 'الورد', copy: 'لأنها تقول الحب بدون ما تتكلم.'},
            {seed: 'tulip', name: 'التوليب', copy: 'لأنها بسيطة، لطيفة، وتدخل القلب.'}
          ]
        : [
            {seed: 'lily', name: 'Lily', copy: 'Because it is soft and regal, like you.'},
            {seed: 'peony', name: 'Peony', copy: 'Because it feels like a princess.'},
            {seed: 'rose', name: 'Rose', copy: 'Because it says love without a word.'},
            {seed: 'tulip', name: 'Tulip', copy: 'Because it is simple, sweet, and goes straight to the heart.'}
          ]
    },

    bouquet: {
      before: ar ? 'افتحي أول باقة' : 'Open the first bouquet',
      hint: ar ? 'المسيها بلطف' : 'tap it gently',
      title: ar ? 'باقة ريماس' : 'The Remas Bouquet',
      lines: ar
        ? [
            'أول باقة في ريماسيا لازم تحمل اسمك.',
            'ناعمة، وردية، فيها ليلي وبيوني، وتشبهك أكثر من أي باقة ثانية.'
          ]
        : [
            'The first bouquet in Remasia had to carry your name.',
            'Soft, pink, with lily and peony — and more like you than any other.'
          ],
      cta: ar ? 'شاهدي باقتك' : 'See your bouquet'
    },

    promise: {
      title: ar ? 'وعد صغير' : 'A tiny promise',
      lines: ar
        ? ['مو لازم تبدئين اليوم.', 'ولا لازم تعرفين كل شيء من الآن.', 'بس متى ما حسّيتي إنك جاهزة، أنا موجود.', 'نبدأها خطوة خطوة… وردة وردة.']
        : [
            "You don't have to start today.",
            "And you don't have to know everything yet.",
            "But whenever you feel ready, I'm here.",
            "We'll begin step by step… petal by petal."
          ]
    },

    studio: {
      title: ar ? 'استديوك ينتظرك' : 'Your studio is waiting',
      cards: ar
        ? [
            {key: 'magic', label: 'سحر اليوم', copy: 'هنا تشوفين طلباتك وباقاتك.'},
            {key: 'bouquets', label: 'الباقات', copy: 'هنا تصممين عالمك وردة وردة.'},
            {key: 'garden', label: 'حديقة ريماس', copy: 'هنا تحفظين صورك، أفكارك، ورسوماتك.'}
          ]
        : [
            {key: 'magic', label: "Today's Magic", copy: 'Here you see your orders and bouquets.'},
            {key: 'bouquets', label: 'Bouquets', copy: 'Here you design your world, petal by petal.'},
            {key: 'garden', label: 'Remas Garden', copy: 'Here you keep your photos, ideas, and drawings.'}
          ],
      cta: ar ? 'ادخلي الاستديو' : 'Enter your studio'
    },

    secrets: {
      heart: ar ? 'كنت أعرف إنك بتضغطين هنا.' : 'I knew you would press here.',
      flower: ar ? 'هذه أول وردة في عالمك.' : 'This is the first flower in your world.',
      footer: ar ? 'ملاحظة سرية: ريماسيا ما تشبه أحد لأنها منك.' : "Secret note: Remasia is like no one else, because it's from you."
    },

    finalDoor: {
      title: ar ? 'جاهزة تفتحي الباب؟' : 'Ready to open the door?',
      lines: ar ? ['هذا مو مجرد موقع.', 'هذا أول باب لحلمك.'] : ["This isn't just a website.", "This is the first door to your dream."],
      primary: ar ? 'افتحي بوتيكك' : 'Open your boutique',
      secondary: ar ? 'ادخلي استديو ريماس' : "Enter Remas's studio"
    },

    signature: ar ? 'صُنع بحب · إلى ريماس 🤍' : 'made with love · for Remas 🤍'
  };
}

export type LetterContent = ReturnType<typeof getLetterContent>;

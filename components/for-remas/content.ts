import type {Locale} from '@/i18n/routing';

// ─────────────────────────────────────────────────────────────────────────────
// The whole love letter, bilingual. Arabic is the first-class, polished voice —
// this is Ahmed → Remas, not a brand → a customer. English is a faithful, warm
// translation so /en still reads as a gift. Hero title/body still come from the
// editable SecretPage row (so Remas can change them in the Studio); the copy
// below is the keepsake content + the hidden surprises.
//
// Symbols tucked in quietly: passcode 2802 · order RM-2802 · timestamp 02:28 ·
// 28 drifting petals · 20 wishes · "2 lilies + 8 peonies" — her birthday, softly.
// ─────────────────────────────────────────────────────────────────────────────

export function getForRemasContent(locale: Locale) {
  const ar = locale === 'ar';

  return {
    hero: {
      label: ar ? 'سر صغير لكِ وحدك' : 'A little secret, just for you',
      // Fallbacks only — the live hero title/body come from the SecretPage row.
      title: ar ? 'قبل ما يكون بوتيكك، كان حلمك.' : 'Before this was your boutique, it was your dream.',
      body: ar
        ? 'كل وردة هنا تتذكر أمنية همستِ بها يومًا. هذا العالم الصغير ما انفتح إلا لأجلك. حلمتِ به، وها هو الآن — وردة وردة — لكِ. إلى الأبد.'
        : 'Every flower here remembers a wish you once whispered. This little world only opened because of you. You dreamed it — and now, petal by petal, it is yours. Forever.',
      primary: ar ? 'افتحي بوتيكك' : 'Open your boutique',
      secondary: ar ? 'ادخلي الاستديو' : 'Enter the studio',
      note: ar ? 'ملاحظة: أنتِ أجمل وردة في هذا المكان 🌷' : 'P.S. you are the most beautiful flower in this place. 🌷'
    },

    // 2 — the folded letter
    letter: {
      salutation: ar ? 'إلى ريماس،' : 'To Remas,',
      lines: ar
        ? [
            'يوم قلتي لي إن حلمك تفتحين بوتيك ورد…',
            'يمكن كانت جملة بسيطة،',
            'بس أنا ما قدرت أنساها.',
            'لأن بعض الأحلام لما تطلع منكِ، تصير تستحق تنبني وردة وردة.'
          ]
        : [
            'The day you told me your dream was to open a flower boutique…',
            'maybe it was just a simple sentence,',
            'but I could never forget it.',
            'Because some dreams, when they come from you, deserve to be built petal by petal.'
          ],
      openHint: ar ? 'افتحي الرسالة' : 'open the letter'
    },

    // 3 — built from pieces of you (keepsake notes)
    keepsakes: {
      title: ar ? 'بنيت ريماسيا من أشياء تشبهك' : 'I built Remasia from pieces of you',
      hint: ar ? 'كل قصاصة فيها سبب صغير' : 'each note holds a little reason',
      items: ar
        ? [
            {label: 'لونك الوردي', copy: 'لأنه مو لون… هو مزاجك، وصار لون المكان كله.'},
            {label: 'فنك', copy: 'لأنك تشوفين الجمال قبل ما يصير واضح.'},
            {label: 'نعومتك', copy: 'لأن كل شي لمستِه هنا صار أنعم.'},
            {label: 'دلالك', copy: 'لأن حتى الورد يستحق شوية دلع.'},
            {label: 'ديفا', copy: 'لأن حتى الورد يحتاج حضور.'},
            {label: 'دراماك الكيوت', copy: 'لأنها الدراما الوحيدة اللي تخلي القلب يبتسم.'},
            {label: 'حساسيتك', copy: 'لأنها تخليكِ تفهمين الأشياء اللي غيرك ما ينتبه لها.'},
            {label: 'حلمك', copy: 'لأنه البذرة اللي طلع منها كل هذا.'}
          ]
        : [
            {label: 'Your pink', copy: 'Because it isn’t a color… it’s your mood, and now it’s the color of this whole place.'},
            {label: 'Your art', copy: 'Because you see beauty before it becomes obvious.'},
            {label: 'Your softness', copy: 'Because everything you touched here became softer.'},
            {label: 'Your charm', copy: 'Because even flowers deserve a little spoiling.'},
            {label: 'Diva', copy: 'Because even flowers need presence.'},
            {label: 'Your cute drama', copy: 'Because it’s the only kind of drama that makes a heart smile.'},
            {label: 'Your tenderness', copy: 'Because it lets you understand what others never notice.'},
            {label: 'Your dream', copy: 'Because it’s the seed all of this grew from.'}
          ]
    },

    // 4 — pressed flowers (diary keepsakes)
    pressed: {
      title: ar ? 'الورود اللي اختارتك' : 'The flowers that chose you',
      hint: ar ? 'من دفتر ورد ريماسيا' : 'from Remasia’s flower diary',
      items: ar
        ? [
            {flower: 'lily' as const, name: 'الليلي', copy: 'لأن نعومته تشبه حضورك.'},
            {flower: 'peony' as const, name: 'البيوني', copy: 'لأنها أميرة بطبعها، مثل بعض الناس.'},
            {flower: 'rose' as const, name: 'الورد', copy: 'لأنه يقول الحب لما الكلام يتوتر.'},
            {flower: 'tulip' as const, name: 'التوليب', copy: 'لأنه بسيط، لطيف، ويبتسم للقلب.'}
          ]
        : [
            {flower: 'lily' as const, name: 'Lily', copy: 'Because its softness is like your presence.'},
            {flower: 'peony' as const, name: 'Peony', copy: 'Because it’s a princess by nature, like some people.'},
            {flower: 'rose' as const, name: 'Rose', copy: 'Because it says love when words get nervous.'},
            {flower: 'tulip' as const, name: 'Tulip', copy: 'Because it’s simple, sweet, and smiles to the heart.'}
          ]
    },

    // 5 — the wrapped gift: the first bouquet
    gift: {
      before: ar ? 'أول باقة في ريماسيا مخبّأة لكِ' : 'The first bouquet in Remasia is hidden for you',
      button: ar ? 'افتحيها' : 'open it',
      title: ar ? 'باقة ريماس' : 'The Remas Bouquet',
      lines: ar
        ? [
            'أول باقة في ريماسيا ما كانت للبيع.',
            'كانت لكِ.',
            'فيها ليلي، بيوني، وردي، وشيء صغير من كل تفصيلة أحبها فيكِ.'
          ]
        : [
            'The first bouquet in Remasia was never for sale.',
            'It was for you.',
            'Lily, peony, rose — and a little of every detail I love about you.'
          ],
      detail: ar
        ? 'وفي خيالي فيها ٢ ليلي و٨ بيوني… لأن حتى تاريخك صار يعرف يختار ورد.'
        : 'And in my mind it holds 2 lilies and 8 peonies… because even your date learned how to choose flowers.',
      cta: ar ? 'شاهدي باقتك' : 'See your bouquet'
    },

    // 6 — the first order receipt
    order: {
      title: ar ? 'أول طلب في ريماسيا' : 'The first order in Remasia',
      labels: ar
        ? {number: 'رقم الطلب', customer: 'العميل', bouquet: 'الباقة', status: 'الحالة', gift: 'كلمة الإهداء'}
        : {number: 'Order no.', customer: 'Customer', bouquet: 'Bouquet', status: 'Status', gift: 'Gift message'},
      number: 'RM-2802',
      customer: ar ? 'أحمد' : 'Ahmed',
      bouquet: ar ? 'باقة ريماس' : 'The Remas Bouquet',
      status: ar ? 'تم التسليم بحب' : 'Delivered with love',
      giftMessage: ar ? 'إلى البنت اللي خلت الورد يصير له معنى.' : 'To the girl who gave flowers their meaning.',
      footnote: ar
        ? 'ملاحظة للفلورست: جهزيها كأنها أهم باقة في العالم.'
        : 'Note to the florist: prepare it like it’s the most important bouquet in the world.'
    },

    // 7 — 20 wishes
    wishes: {
      title: ar ? '٢٠ أمنية صغيرة لكِ' : '20 little wishes for you',
      subtitle: ar ? 'كل أمنية هنا وردة صغيرة.' : 'Each wish here is a little flower.',
      items: ar
        ? [
            'أتمنى تشوفين نفسك مثل ما أشوفك.',
            'أتمنى حلمك يصير أخف عليكِ.',
            'أتمنى كل مرة تتعبين تلقين شيء يطمنك.',
            'أتمنى ريماسيا تذكّرك إنك تقدرين.',
            'أتمنى الورد يرد لكِ شوي من جمالك.',
            'أتمنى تضحكين كل ما تفتحين هذا المكان.',
            'أتمنى الجامعة ما تطفي لمعتك.',
            'أتمنى تعرفين إنك مو متأخرة.',
            'أتمنى كل وردة هنا تلمس قلبك.',
            'أتمنى تبقين ناعمة حتى لو العالم كان ثقيل.',
            'أتمنى أحلامك ما تخوفك.',
            'أتمنى أكون أمان للحلم، مو ضغط عليه.',
            'أتمنى تشوفين إن البداية ممكنة.',
            'أتمنى كل يوم يذكّرك بشيء حلو فيكِ.',
            'أتمنى دلالك يزيد وما ينقص.',
            'أتمنى دراماك تبقى كيوت.',
            'أتمنى فنك يلقى مكانه هنا.',
            'أتمنى ريماسيا تصير مساحة لكِ.',
            'أتمنى أكون جنبك خطوة خطوة.',
            'أتمنى كل مرة تحبين الورد، تتذكرين إنك تشبهينه.'
          ]
        : [
            'I wish you saw yourself the way I see you.',
            'I wish your dream felt lighter on you.',
            'I wish that every time you’re tired, you find something that reassures you.',
            'I wish Remasia reminds you that you can.',
            'I wish the flowers give you back a little of your beauty.',
            'I wish you smile every time you open this place.',
            'I wish university never dims your shine.',
            'I wish you know you’re not late.',
            'I wish every flower here touches your heart.',
            'I wish you stay soft, even when the world is heavy.',
            'I wish your dreams never scare you.',
            'I wish to be safety for the dream, not pressure on it.',
            'I wish you see that the beginning is possible.',
            'I wish every day reminds you of something lovely in you.',
            'I wish your charm grows and never fades.',
            'I wish your drama stays cute.',
            'I wish your art finds its place here.',
            'I wish Remasia becomes a space that’s yours.',
            'I wish to be beside you, step by step.',
            'I wish that every time you love a flower, you remember you’re like one.'
          ]
    },

    // 8 — when everything is too much (calm, spacious)
    overwhelm: {
      title: ar ? 'لما تحسين إن كل شيء كثير' : 'When everything feels like too much',
      lines: ar
        ? [
            'لا تفتحين ريماسيا كواجب.',
            'افتحيها كتذكير.',
            'إن حلمك ما راح يهرب.',
            'وإنك مو مطالبة تبدئين اليوم.',
            'أنا بس حبيت أخليك تشوفين إن الباب موجود… ومتى ما تبغين، نفتحه سوا.'
          ]
        : [
            'Don’t open Remasia like a task.',
            'Open it like a reminder.',
            'That your dream won’t run away.',
            'And that you’re not required to start today.',
            'I just wanted you to see the door is here… and whenever you want, we’ll open it together.'
          ]
    },

    // 9 — sealed mood letters
    moods: {
      title: ar ? 'رسائل تفتحينها وقت الحاجة' : 'Letters to open when you need them',
      openHint: ar ? 'افتحي الرسالة' : 'open the letter',
      letters: ar
        ? [
            {title: 'لما تشتاقين للحلم', lines: ['الحلم ما راح يزعل إذا تأخرتِ عليه.', 'هو يعرف إن الأشياء الجميلة تحتاج وقت.']},
            {title: 'لما تتعبين', lines: ['مو لازم تكونين قوية طول الوقت.', 'حتى الورد يحتاج ماء، هدوء، ووقت عشان يتفتح.']},
            {title: 'لما تحسين إنك كيوت زيادة', lines: ['إيه، كيوت زيادة.', 'وبصراحة الصفحة كلها شاهدة.']},
            {title: 'لما تنسين قيمتك', lines: ['أنتِ مو ضيفة في هذا العالم.', 'أنتِ السبب إنه موجود.']}
          ]
        : [
            {title: 'When you miss the dream', lines: ['The dream won’t be upset if you’re late to it.', 'It knows beautiful things take time.']},
            {title: 'When you’re tired', lines: ['You don’t have to be strong all the time.', 'Even flowers need water, quiet, and time to bloom.']},
            {title: 'When you feel a little too cute', lines: ['Yes, a little too cute.', 'And honestly, this whole page is a witness.']},
            {title: 'When you forget your worth', lines: ['You’re not a guest in this world.', 'You’re the reason it exists.']}
          ]
    },

    // 10 — the final key
    ending: {
      title: ar ? 'هذا مفتاح عالمك' : 'This is the key to your world',
      lines: ar ? ['مو لازم تفتحينه اليوم.', 'بس صار عندك باب.'] : ['You don’t have to open it today.', 'But now you have a door.'],
      primary: ar ? 'افتحي بوتيكك' : 'Open your boutique',
      secondary: ar ? 'ادخلي استديو ريماس' : 'Enter Remas’s studio',
      note: ar ? 'ما بنيت لكِ موقع… بنيت لكِ أول باب لحلمك.' : 'I didn’t build you a website… I built you the first door to your dream.'
    },

    signature: ar ? 'من أحمد، إلى ريماس' : 'From Ahmed, to Remas',

    // ── hidden surprises ──────────────────────────────────────────────────────
    eggs: {
      flowerCycle: ar
        ? [
            'هذه أول وردة في عالمك.',
            'لو كان الحلم وردة، كان بيشبهك.',
            'واضح إنك تحبين الأسرار.',
            'سر صغير: أنا فخور فيكِ حتى قبل ما تبدئين.',
            'خلاص… الوردة صارت تغار من اهتمامي فيكِ.'
          ]
        : [
            'This is the first flower in your world.',
            'If a dream were a flower, it would look like you.',
            'Clearly, you love secrets.',
            'A little secret: I’m proud of you even before you begin.',
            'Okay… now the flower is jealous of how much I notice you.'
          ],
      heartToasts: ar
        ? [
            'كنت أعرف إنك بتضغطين هنا.',
            'كل هذا المكان يغار منكِ.',
            'حتى الوردة اللي فوق تنتبه لكِ.',
            'في أشياء ما تنقال… فبنيتها لكِ.',
            'ترى الصفحة تبتسم يوم تفتحينها.',
            'مو بس ريماسيا وردية… أنتِ اللي خليتيها كذا.'
          ]
        : [
            'I knew you’d press here.',
            'This whole place is jealous of you.',
            'Even the flower above is paying attention to you.',
            'Some things can’t be said… so I built them for you.',
            'This page smiles the day you open it.',
            'Remasia isn’t just pink… you’re the one who made it that way.'
          ],
      doNotClick: {
        label: ar ? 'لا تضغطين هنا' : 'don’t click here',
        reveals: ar
          ? ['كنت أدري إنك درامية وما بتسمعين الكلام.', 'وهذا أكثر شيء كيوت فيكِ.']
          : ['I knew you’re dramatic and wouldn’t listen.', 'And that’s the cutest thing about you.']
      },
      passcode: {
        title: ar ? 'فيه سر ما يفتحه إلا تاريخ صغير…' : 'There’s a secret only a little date can open…',
        placeholder: ar ? 'اكتبي الرمز' : 'type the code',
        button: ar ? 'افتحي السر' : 'open the secret',
        code: '2802',
        reveals: ar
          ? ['يوم 28/02 ما كان يوم عادي.', 'كان اليوم اللي بدأت فيه أجمل وردة تعرف طريقها للعالم.']
          : ['28/02 was no ordinary day.', 'It was the day the most beautiful flower found her way to the world.'],
        after: ar ? 'أنتِ السبب إن ريماسيا موجودة.' : 'You’re the reason Remasia exists.',
        wrong: ar ? 'مو هذا الرمز… بس محاولة حلوة 🌷' : 'Not quite the code… but a lovely try 🌷'
      },
      timestamp: {
        value: '02:28',
        reveals: ar
          ? ['حتى الوقت هنا حافظ تاريخك.', 'في أشياء صغيرة ما أنساها… لأنها منكِ.']
          : ['Even the time here remembers your date.', 'There are little things I never forget… because they’re from you.']
      },
      compliment: {
        label: ar ? 'اضغطي وخذي مجاملة' : 'tap for a compliment',
        items: ar
          ? [
              'كيوت بطريقة تخرب التركيز.',
              'ناعمة كأنك طالعة من وردة.',
              'ديفا بس قلبك وردي.',
              'أميرة حتى لو ما اعترفتي.',
              'ضحكتك تصلح تكون شعار البوتيك.',
              'كل شيء وردي يحاول يشبهك.',
              'أنتِ مو بس تحبين الورد… أنتِ تشبهينه.',
              'حتى الكود هنا مستحي منك.',
              'دراماك من النوع اللي يخلي الواحد يبتسم.',
              'لو اللطف له شكل، كان يشبهك.'
            ]
          : [
              'Cute in a way that ruins focus.',
              'Soft like you came out of a flower.',
              'A diva, but with a pink heart.',
              'A princess, even if you won’t admit it.',
              'Your laugh could be the boutique’s logo.',
              'Everything pink is trying to look like you.',
              'You don’t just love flowers… you look like one.',
              'Even the code here is shy around you.',
              'Your drama is the kind that makes someone smile.',
              'If kindness had a shape, it would look like you.'
            ]
      },
      typedName: {
        hint: ar ? 'فيه كلمة تفتح وردة مخبأة…' : 'There’s a word that opens a hidden flower…',
        names: ['ريماس', 'remas'],
        title: ar ? 'أهلًا بصاحبة المكان' : 'Welcome, owner of this place',
        copy: ar
          ? 'كان لازم العالم يعرف إن ريماسيا ما بدأت من فكرة… بدأت منكِ.'
          : 'The world had to know Remasia didn’t start from an idea… it started from you.',
        button: ar ? 'افتحي الوردة السرية' : 'open the secret flower',
        after: ar ? 'أنتِ السبب إن هذا المكان موجود.' : 'You’re the reason this place exists.'
      },
      footerSecret: {
        base: ar ? 'صُنعت بالورد، والكود، وكثير من الحب.' : 'Made with flowers, code, and a lot of love.',
        reveals: ar ? ['وكثير يعني كثير.', 'أكثر مما تتوقعين.'] : ['And a lot means a lot.', 'More than you expect.']
      }
    }
  };
}

export type ForRemasContent = ReturnType<typeof getForRemasContent>;

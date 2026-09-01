import React, { useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, FlatList, Switch, Modal, Alert, Platform, Image
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const USERS = [
  {id:"741025",name:"سارة",age:24,country:"العراق",gender:"أنثى",online:true,color:"#8B5CF6",bio:"أحب الموسيقى والسفر والتعرف على أصدقاء جدد."},
  {id:"852146",name:"نور",age:22,country:"مصر",gender:"أنثى",online:true,color:"#EC4899",bio:"مهتمة بالتصوير والقراءة."},
  {id:"963214",name:"أحمد",age:27,country:"العراق",gender:"ذكر",online:true,color:"#3B82F6",bio:"أحب الرياضة والألعاب."},
  {id:"417852",name:"ليلى",age:25,country:"السعودية",gender:"أنثى",online:false,color:"#6366F1",bio:"أحب القهوة والرحلات."},
  {id:"369741",name:"علي",age:29,country:"العراق",gender:"ذكر",online:false,color:"#10B981",bio:"التقنية والموسيقى من اهتماماتي."}
];

const INITIAL_POSTS = [
  {id:"1",name:"سارة",text:"مساء الخير للجميع 🌙 منو يحب الدردشة؟",likes:18,color:"#8B5CF6",media:null,hashtags:["#وصال","#دردشة"]},
  {id:"2",name:"أحمد",text:"اليوم كان يوم جميل! أتمنى لكم يوم سعيد ❤️",likes:12,color:"#3B82F6",media:null,hashtags:[]}
];

const CHATS = [
  {id:"1",name:"سارة",message:"مرحبا! كيف حالك؟",time:"09:30",unread:2,color:"#8B5CF6"},
  {id:"2",name:"نور",message:"أرسلت لك صورة",time:"08:45",unread:1,color:"#EC4899"},
  {id:"3",name:"أحمد",message:"تم تسجيل الدخول",time:"أمس",unread:0,color:"#3B82F6"}
];

const colors = {
  primary:"#6C63FF", pink:"#D946EF", green:"#22C55E",
  dark:{bg:"#071225",card:"#111E36",text:"#F8FAFC",muted:"#9AA9C0",border:"#22314E",input:"#0C1930"},
  light:{bg:"#F5F7FC",card:"#FFFFFF",text:"#172033",muted:"#68748A",border:"#E2E7F0",input:"#FFFFFF"}
};

const GEM_COST = 10;

function Avatar({name,color="#6C63FF",size=54}) {
  return <View style={[styles.avatar,{width:size,height:size,borderRadius:size/2,backgroundColor:color}]}>
    <Text style={{color:"#fff",fontSize:size*.38,fontWeight:"800"}}>{name?.slice(0,1)}</Text>
  </View>;
}
function Button({title,onPress,secondary=false}) {
  return <Pressable onPress={onPress} style={[styles.button,secondary&&styles.secondaryButton]}>
    <Text style={[styles.buttonText,secondary&&styles.secondaryText]}>{title}</Text>
  </Pressable>;
}
function Screen({children,theme}) { return <SafeAreaView style={[styles.safe,{backgroundColor:theme.bg}]}>{children}</SafeAreaView>; }
function Card({children,theme}) { return <View style={[styles.card,{backgroundColor:theme.card,borderColor:theme.border}]}>{children}</View>; }
function Person({p,theme,onPress}) {
  return <Pressable onPress={onPress}><Card theme={theme}>
    <View style={styles.person}>
      <Avatar name={p.name} color={p.color}/>
      <View style={{flex:1}}>
        <Text style={[styles.name,{color:theme.text}]}>{p.name} • {p.age}</Text>
        <Text style={[styles.muted,{color:theme.muted}]}>{p.gender} • {p.country} • ID: {p.id}</Text>
      </View>
      <Text style={styles.arrow}>‹</Text>
    </View>
  </Card></Pressable>;
}

export default function App() {
  const [screen,setScreen]=useState("welcome");
  const [dark,setDark]=useState(true);
  const [gender,setGender]=useState("الكل");
  const [country,setCountry]=useState("الكل");
  const [search,setSearch]=useState("");
  const [idSearch,setIdSearch]=useState("");
  const [person,setPerson]=useState(USERS[0]);
  const [modal,setModal]=useState(null);
  const [balance,setBalance]=useState(30);
  const [liked,setLiked]=useState({});
  const [postText,setPostText]=useState("");
  const [hashtags,setHashtags]=useState("");
  const [postMedia,setPostMedia]=useState(null);
  const [posts,setPosts]=useState(INITIAL_POSTS);
  const [openedChats,setOpenedChats]=useState({"741025":true,"852146":true,"963214":true});
  const theme=dark?colors.dark:colors.light;

  const filtered=useMemo(()=>USERS.filter(p=>
    (gender==="الكل"||p.gender===gender)&&
    (country==="الكل"||p.country===country)&&
    (!search||p.name.includes(search))
  ),[gender,country,search]);

  const openUser=(p)=>{setPerson(p);setScreen("profileView");};

  const startChat=(p)=>{
    if(openedChats[p.id]) { setPerson(p); setScreen("chat"); return; }
    if(balance < GEM_COST) {
      Alert.alert("الجواهر غير كافية",`تحتاج ${GEM_COST} جواهر لفتح أول محادثة مع ${p.name}. رصيدك الحالي ${balance} 💎.`);
      return;
    }
    Alert.alert("فتح المحادثة",`فتح أول محادثة مع ${p.name} مقابل ${GEM_COST} جواهر؟`,[
      {text:"إلغاء",style:"cancel"},
      {text:`دفع ${GEM_COST} 💎`,onPress:()=>{
        setBalance(v=>v-GEM_COST);
        setOpenedChats(v=>({...v,[p.id]:true}));
        setScreen("chat");
      }}
    ]);
  };

  const pickPostMedia=async()=>{
    const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted){ Alert.alert("صلاحية مطلوبة","اسمح للتطبيق بالوصول إلى الصور والفيديو لاختيار وسائط للمنشور."); return; }
    const result=await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 120
    });
    if(!result.canceled && result.assets?.[0]){
      const a=result.assets[0];
      setPostMedia({uri:a.uri,type:a.type||"image",fileName:a.fileName||""});
    }
  };

  const publishPost=()=>{
    if(!postText.trim() && !postMedia){Alert.alert("منشور فارغ","اكتب نصاً أو أضف صورة/فيديو أولاً.");return;}
    const tags=hashtags.trim().split(/\s+/).filter(Boolean).map(x=>x.startsWith("#")?x:`#${x}`);
    setPosts([{id:Date.now().toString(),name:"أحمد",text:postText.trim(),likes:0,color:"#3B82F6",media:postMedia,hashtags:tags},...posts]);
    setPostText(""); setHashtags(""); setPostMedia(null);
    Alert.alert("تم النشر","تمت إضافة منشورك مع الوسائط والهاشتاقات الاختيارية.");
  };

  const nav=<View style={[styles.nav,{backgroundColor:theme.card,borderColor:theme.border}]}>
    {[['home','⌂','الرئيسية'],['search','⌕','البحث'],['posts','✦','المنشورات'],['chats','◌','الدردشة'],['profile','◯','ملفي']].map(x=><Pressable key={x[0]} onPress={()=>setScreen(x[0])} style={styles.navItem}>
      <Text style={[styles.navIcon,{color:screen===x[0]?colors.primary:theme.muted}]}>{x[1]}</Text>
      <Text style={[styles.navText,{color:screen===x[0]?colors.primary:theme.muted}]}>{x[2]}</Text>
    </Pressable>)}
  </View>;

  if(screen==="welcome") return <Screen theme={theme}><View style={styles.welcome}>
    <View style={styles.logo}><Text style={{fontSize:42}}>💬</Text></View><Text style={[styles.hero,{color:theme.text}]}>وصال</Text>
    <Text style={[styles.subtitle,{color:theme.muted}]}>دردشة وتعارف ومجتمع</Text>
    <Text style={[styles.description,{color:theme.muted}]}>تعرّف على أصدقاء، شارك منشورات، وافتح محادثات خاصة باستخدام الجواهر.</Text>
    <Button title="ابدأ الآن" onPress={()=>setScreen("login")}/>
  </View></Screen>;

  if(screen==="login") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.form}><Text style={[styles.title,{color:theme.text}]}>تسجيل الدخول</Text>
    <TextInput placeholder="البريد الإلكتروني" placeholderTextColor={theme.muted} style={[styles.input,{color:theme.text,backgroundColor:theme.input,borderColor:theme.border}]}/>
    <TextInput placeholder="كلمة المرور" placeholderTextColor={theme.muted} secureTextEntry style={[styles.input,{color:theme.text,backgroundColor:theme.input,borderColor:theme.border}]}/>
    <Button title="دخول" onPress={()=>setScreen("home")}/><Button title="إنشاء حساب جديد" secondary onPress={()=>setScreen("signup")}/>
  </ScrollView></Screen>;

  if(screen==="signup") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.form}><Text style={[styles.title,{color:theme.text}]}>إنشاء حساب</Text>
    {["الاسم الكامل","البريد الإلكتروني","كلمة المرور","الدولة"].map(x=><TextInput key={x} placeholder={x} placeholderTextColor={theme.muted} style={[styles.input,{color:theme.text,backgroundColor:theme.input,borderColor:theme.border}]}/>)}
    <Text style={[styles.label,{color:theme.text}]}>الجنس</Text><View style={styles.row}>{["ذكر","أنثى"].map(x=><Pressable key={x} onPress={()=>setGender(x)} style={[styles.choice,gender===x&&styles.activeChoice,{borderColor:theme.border}]}><Text style={{color:gender===x?"#fff":theme.text}}>{x}</Text></Pressable>)}</View>
    <Button title="إنشاء الحساب" onPress={()=>setScreen("home")}/>
  </ScrollView></Screen>;

  if(screen==="home") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}>
    <View style={styles.header}><View><Text style={[styles.muted,{color:theme.muted}]}>مرحباً بك 👋</Text><Text style={[styles.title,{color:theme.text}]}>اكتشف عالم وصال</Text></View>
      <View style={styles.headerActions}><Pressable onPress={()=>setScreen("wallet")} style={styles.gemPill}><Text style={styles.gemText}>💎 {balance}</Text></Pressable><Pressable onPress={()=>setScreen("settings")}><Text style={[styles.bigIcon,{color:theme.text}]}>⚙</Text></Pressable></View>
    </View>
    <Pressable onPress={()=>setModal("match")}><View style={styles.heroCard}><Text style={styles.heroCardTitle}>🔎 بحث سريع مدفوع بالجواهر</Text><Text style={styles.heroCardSub}>حدد الجنس واعثر على أشخاص يبحثون الآن. أول محادثة مع شخص جديد = {GEM_COST} 💎.</Text><View style={styles.pill}><Text style={styles.pillText}>ابدأ البحث</Text></View></View></Pressable>
    <View style={styles.grid}>{[["💎","الجواهر",`${balance} جواهر`,`wallet`],["📞","اتصال","صوت وفيديو","calls"],["👥","الأصدقاء","طلبات وأصدقاء","friends"],["🔔","الإشعارات","أخبار حسابك","notifications"]].map(x=><Pressable key={x[3]} onPress={()=>setScreen(x[3])} style={[styles.tile,{backgroundColor:theme.card,borderColor:theme.border}]}><Text style={styles.tileIcon}>{x[0]}</Text><Text style={[styles.tileTitle,{color:theme.text}]}>{x[1]}</Text><Text style={[styles.muted,{color:theme.muted}]}>{x[2]}</Text></Pressable>)}</View>
    <Text style={[styles.section,{color:theme.text}]}>متصلون الآن</Text>
    <FlatList horizontal inverted data={USERS.filter(p=>p.online)} keyExtractor={p=>p.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:14}} renderItem={({item})=><Pressable onPress={()=>openUser(item)}><Avatar name={item.name} color={item.color} size={64}/><Text style={[styles.center,{color:theme.text}]}>{item.name}</Text></Pressable>}/>
    <Text style={[styles.section,{color:theme.text}]}>اقتراحات لك</Text>{USERS.slice(0,3).map(p=><Person key={p.id} p={p} theme={theme} onPress={()=>openUser(p)}/>)}</ScrollView>{nav}
    <MatchModal visible={modal==="match"} theme={theme} gender={gender} setGender={setGender} onClose={()=>setModal(null)} onChat={p=>{setModal(null);setPerson(p);startChat(p);}} balance={balance}/>
  </Screen>;

  if(screen==="search") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><View style={styles.header}><Text style={[styles.title,{color:theme.text}]}>البحث عن صديق</Text><View style={styles.gemPill}><Text style={styles.gemText}>💎 {balance}</Text></View></View>
    <TextInput value={search} onChangeText={setSearch} placeholder="ابحث بالاسم..." placeholderTextColor={theme.muted} style={[styles.input,{color:theme.text,backgroundColor:theme.input,borderColor:theme.border}]}/>
    <TextInput value={idSearch} onChangeText={setIdSearch} placeholder="أو أدخل ID المستخدم..." placeholderTextColor={theme.muted} keyboardType="number-pad" style={[styles.input,{color:theme.text,backgroundColor:theme.input,borderColor:theme.border}]}/>
    <Button title="بحث بالـ ID" onPress={()=>{const p=USERS.find(x=>x.id===idSearch.trim()); if(p) openUser(p); else Alert.alert("لم يتم العثور","تأكد من رقم ID.");}}/>
    <Text style={[styles.infoBox,{color:theme.muted}]}>💎 أول مرة تفتح محادثة مع شخص جديد تحتاج {GEM_COST} جواهر فقط. بعد فتحها، الرسائل مع نفس الشخص لا تخصم جواهر مرة أخرى.</Text>
    <Text style={[styles.label,{color:theme.text}]}>الجنس</Text><View style={styles.row}>{["الكل","ذكر","أنثى"].map(x=><Pressable key={x} onPress={()=>setGender(x)} style={[styles.choice,gender===x&&styles.activeChoice,{borderColor:theme.border}]}><Text style={{color:gender===x?"#fff":theme.text}}>{x}</Text></Pressable>)}</View>
    <Text style={[styles.label,{color:theme.text}]}>الدولة</Text><View style={styles.wrap}>{["الكل","العراق","مصر","السعودية"].map(x=><Pressable key={x} onPress={()=>setCountry(x)} style={[styles.smallChoice,country===x&&styles.activeChoice,{borderColor:theme.border}]}><Text style={{color:country===x?"#fff":theme.text}}>{x}</Text></Pressable>)}</View>
    <Text style={[styles.section,{color:theme.text}]}>النتائج ({filtered.length})</Text>{filtered.map(p=><Person key={p.id} p={p} theme={theme} onPress={()=>openUser(p)}/>)}</ScrollView>{nav}</Screen>;

  if(screen==="posts") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><Text style={[styles.title,{color:theme.text}]}>المنشورات</Text>
    <Card theme={theme}><TextInput value={postText} onChangeText={setPostText} multiline placeholder="اكتب منشورك..." placeholderTextColor={theme.muted} style={[styles.postInput,{color:theme.text}]}/>
      <TextInput value={hashtags} onChangeText={setHashtags} placeholder="هاشتاقات اختيارية: #وصال #دردشة" placeholderTextColor={theme.muted} style={[styles.input,{color:theme.text,backgroundColor:theme.input,borderColor:theme.border,marginTop:8}]}/>
      {postMedia&&<MediaPreview media={postMedia} theme={theme} removable onRemove={()=>setPostMedia(null)}/>}<View style={styles.mediaRow}><Pressable onPress={pickPostMedia} style={styles.mediaButton}><Text style={styles.mediaButtonText}>🖼️ إضافة صورة / GIF</Text></Pressable><Pressable onPress={pickPostMedia} style={styles.mediaButton}><Text style={styles.mediaButtonText}>🎥 إضافة فيديو</Text></Pressable></View>
      <Text style={[styles.muted,{color:theme.muted,textAlign:"right"}]}>يمكن اختيار صورة ثابتة أو GIF متحرك أو فيديو من المعرض. الهاشتاقات اختيارية.</Text><Button title="نشر" onPress={publishPost}/>
    </Card>
    {posts.map(p=><PostCard key={p.id} p={p} theme={theme} liked={!!liked[p.id]} onLike={()=>setLiked({...liked,[p.id]:!liked[p.id]})}/>)}
  </ScrollView>{nav}</Screen>;

  if(screen==="chats") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><View style={styles.header}><Text style={[styles.title,{color:theme.text}]}>الدردشات</Text><View style={styles.gemPill}><Text style={styles.gemText}>💎 {balance}</Text></View></View>
    <Text style={[styles.infoBox,{color:theme.muted}]}>المحادثة الأولى مع أي شخص جديد تكلف {GEM_COST} 💎 فقط. المحادثات المفتوحة سابقاً مجانية.</Text>
    {CHATS.map(c=><Pressable key={c.id} onPress={()=>{setPerson(USERS.find(x=>x.name===c.name)||USERS[0]);setScreen("chat")}}><Card theme={theme}><View style={styles.person}><Avatar name={c.name} color={c.color}/><View style={{flex:1}}><Text style={[styles.name,{color:theme.text}]}>{c.name}</Text><Text style={[styles.muted,{color:theme.muted}]}>{c.message}</Text></View><Text style={{color:theme.muted}}>{c.time}</Text></View></Card></Pressable>)}</ScrollView>{nav}</Screen>;

  if(screen==="chat") return <ChatScreen person={person} theme={theme} onBack={()=>setScreen("chats")}/>;

  if(screen==="profileView") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><Pressable onPress={()=>setScreen("search")}><Text style={styles.back}>رجوع ‹</Text></Pressable><View style={styles.profile}><Avatar name={person.name} color={person.color} size={100}/><Text style={[styles.profileName,{color:theme.text}]}>{person.name} • {person.age}</Text><Text style={[styles.muted,{color:theme.muted}]}>{person.gender} • {person.country} • ID: {person.id}</Text><Text style={[styles.bio,{color:theme.text}]}>{person.bio}</Text></View>
    <View style={styles.profileActions}><Button title={openedChats[person.id]?"فتح المحادثة":"فتح أول محادثة • 10 💎"} onPress={()=>startChat(person)}/><Button title="إضافة صديق" secondary onPress={()=>Alert.alert("تم","تم إرسال طلب الصداقة.")}/></View>
    {!openedChats[person.id]&&<Text style={[styles.costNote,{color:theme.muted}]}>💎 سيتم خصم {GEM_COST} جواهر مرة واحدة فقط عند فتح أول محادثة مع هذا الشخص. رصيدك: {balance} 💎</Text>}
    <View style={styles.rowButtons}><Pressable style={[styles.action,{backgroundColor:theme.card}]} onPress={()=>Alert.alert("تبليغ","تم تجهيز خيار التبليغ.")}><Text style={styles.actionIcon}>⚑</Text><Text style={{color:theme.text}}>تبليغ</Text></Pressable><Pressable style={[styles.action,{backgroundColor:theme.card}]} onPress={()=>Alert.alert("حظر","تم تجهيز خيار الحظر.")}><Text style={styles.actionIcon}>⛔</Text><Text style={{color:theme.text}}>حظر</Text></Pressable></View>
  </ScrollView></Screen>;

  if(screen==="profile") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><Text style={[styles.title,{color:theme.text}]}>ملفي الشخصي</Text><View style={styles.profile}><Avatar name="أ" color="#3B82F6" size={100}/><Text style={[styles.profileName,{color:theme.text}]}>أحمد</Text><Text style={[styles.muted,{color:theme.muted}]}>العراق • ID: 963214</Text></View><Button title="تعديل الملف" onPress={()=>Alert.alert("قريباً","سنضيف تعديل الاسم والصورة والنبذة والدولة.")}/><Button title="المحفظة والجواهر" secondary onPress={()=>setScreen("wallet")}/><Button title="الإعدادات" secondary onPress={()=>setScreen("settings")}/></ScrollView>{nav}</Screen>;

  if(screen==="wallet") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><Text style={[styles.title,{color:theme.text}]}>المحفظة والجواهر</Text><View style={styles.balance}><Text style={{color:"#C7C9E8"}}>الرصيد الحالي</Text><Text style={styles.balanceNumber}>💎 {balance}</Text><Text style={styles.balanceHint}>10 جواهر = أول محادثة مع شخص جديد</Text></View><Text style={[styles.section,{color:theme.text}]}>اختر باقة الشحن</Text>{[["100 جواهر","$1",100],["550 جواهر","$5",550],["1200 جواهر","$10",1200],["3000 جواهر","$25",3000]].map(x=><Pressable key={x[0]} onPress={()=>{setBalance(balance+x[2]);Alert.alert("تجريبي",`تمت إضافة ${x[2]} جواهر محلياً. الدفع الحقيقي يُربط لاحقاً.`)}}><Card theme={theme}><View style={styles.person}><Text style={[styles.name,{color:theme.text}]}>{x[0]}</Text><Text style={{color:colors.primary,fontWeight:"800"}}>{x[1]}</Text></View></Card></Pressable>)}<Button title="طرق الدفع" secondary onPress={()=>Alert.alert("الدفع","سنضيف بوابة الدفع المناسبة لبلدك بعد تحديد مزود الدفع.")}/></ScrollView></Screen>;

  if(screen==="friends") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><Text style={[styles.title,{color:theme.text}]}>الأصدقاء وطلبات الصداقة</Text><Card theme={theme}><Text style={[styles.name,{color:theme.text}]}>طلب صداقة جديد</Text><Text style={[styles.muted,{color:theme.muted}]}>سارة تريد إضافتك إلى الأصدقاء.</Text><View style={styles.row}><Pressable style={styles.choice} onPress={()=>Alert.alert("تم","تم قبول الطلب.")}><Text style={{color:"#fff"}}>قبول</Text></Pressable><Pressable style={styles.choice} onPress={()=>Alert.alert("تم","تم رفض الطلب.")}><Text style={{color:"#fff"}}>رفض</Text></Pressable></View></Card>{USERS.slice(0,3).map(p=><Person key={p.id} p={p} theme={theme} onPress={()=>openUser(p)}/>)}</ScrollView></Screen>;

  if(screen==="calls") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><Text style={[styles.title,{color:theme.text}]}>المكالمات</Text><Card theme={theme}><Text style={[styles.name,{color:theme.text}]}>📞 مكالمة صوتية</Text><Text style={[styles.muted,{color:theme.muted}]}>المكالمات الحقيقية تحتاج خدمة اتصال صوت/فيديو وربط صلاحيات الجهاز.</Text><Button title="اتصال تجريبي" onPress={()=>Alert.alert("اتصال","هذه شاشة تجريبية فقط.")}/></Card><Card theme={theme}><Text style={[styles.name,{color:theme.text}]}>📹 مكالمة فيديو</Text><Text style={[styles.muted,{color:theme.muted}]}>سنربط WebRTC أو مزود مكالمات في المرحلة الإنتاجية.</Text><Button title="فيديو تجريبي" secondary onPress={()=>Alert.alert("فيديو","هذه شاشة تجريبية فقط.")}/></Card></ScrollView></Screen>;

  if(screen==="notifications") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><Text style={[styles.title,{color:theme.text}]}>الإشعارات</Text>{["💬 رسالة جديدة من سارة","👥 طلب صداقة من نور","♥ أعجب أحمد بمنشورك","🔎 وجدنا أشخاصاً يبحثون مثلك"].map((x,i)=><Card key={i} theme={theme}><Text style={[styles.name,{color:theme.text}]}>{x}</Text><Text style={[styles.muted,{color:theme.muted}]}>منذ {i+1} ساعة</Text></Card>)}</ScrollView></Screen>;

  if(screen==="settings") return <Screen theme={theme}><ScrollView contentContainerStyle={styles.page}><Text style={[styles.title,{color:theme.text}]}>الإعدادات</Text><Card theme={theme}><View style={styles.person}><View style={{flex:1}}><Text style={[styles.name,{color:theme.text}]}>الوضع الداكن</Text><Text style={[styles.muted,{color:theme.muted}]}>مظهر مريح للعين</Text></View><Switch value={dark} onValueChange={setDark}/></View></Card>{["الحساب والخصوصية","الأمان والحظر","الإشعارات","اللغة","المساعدة","الشروط والخصوصية"].map(x=><Pressable key={x} onPress={()=>Alert.alert(x,"سيتم تجهيز هذه الصفحة في المرحلة القادمة.")}><Card theme={theme}><Text style={[styles.name,{color:theme.text}]}>{x}</Text></Card></Pressable>)}<Button title="تسجيل الخروج" secondary onPress={()=>setScreen("welcome")}/></ScrollView></Screen>;
  return null;
}

function MediaPreview({media,theme,removable,onRemove}){
  return <View style={[styles.mediaPreview,{borderColor:theme.border}]}>
    {media.type==="video"?<View style={styles.videoBox}><Text style={styles.videoIcon}>▶</Text><Text style={styles.videoLabel}>فيديو جاهز للنشر</Text></View>:<Image source={{uri:media.uri}} style={styles.mediaImage}/>} 
    {removable&&<Pressable onPress={onRemove} style={styles.removeMedia}><Text style={{color:"#fff",fontWeight:"900"}}>×</Text></Pressable>}
  </View>;
}
function PostCard({p,theme,liked,onLike}){
  return <Card theme={theme}><View style={styles.person}><Avatar name={p.name} color={p.color} size={46}/><Text style={[styles.name,{color:theme.text}]}>{p.name}</Text></View>
    {!!p.text&&<Text style={[styles.postText,{color:theme.text}]}>{p.text}</Text>}
    {p.media&&<MediaPreview media={p.media} theme={theme}/>} 
    {!!p.hashtags?.length&&<View style={styles.tags}>{p.hashtags.map(t=><Text key={t} style={styles.tag}>{t}</Text>)}</View>}
    <View style={styles.postActions}><Pressable onPress={onLike}><Text style={{color:liked?"#E11D48":theme.muted}}>♥ {p.likes+(liked?1:0)}</Text></Pressable><Text style={{color:theme.muted}}>💬 تعليق</Text><Text style={{color:theme.muted}}>↗ مشاركة</Text></View>
  </Card>;
}
function ChatScreen({person,theme,onBack}){
  const [message,setMessage]=useState(""); const [messages,setMessages]=useState([{text:"مرحبا! كيف حالك؟",mine:false},{text:"أهلاً، تمام ❤️",mine:true}]);
  return <Screen theme={theme}><View style={{flex:1}}><View style={[styles.chatHeader,{borderBottomColor:theme.border}]}><Pressable onPress={onBack}><Text style={styles.back}>‹</Text></Pressable><Avatar name={person.name} color={person.color} size={44}/><View style={{flex:1}}><Text style={[styles.name,{color:theme.text}]}>{person.name}</Text><Text style={[styles.muted,{color:theme.muted}]}>المحادثة مفتوحة • مجانية</Text></View><Text style={styles.callIcon}>📞</Text></View>
    <ScrollView contentContainerStyle={styles.messages}>{messages.map((m,i)=><Bubble key={i} text={m.text} mine={m.mine} theme={theme}/>)}</ScrollView>
    <View style={[styles.messageBar,{borderColor:theme.border,backgroundColor:theme.card}]}><TextInput value={message} onChangeText={setMessage} placeholder="اكتب رسالة..." placeholderTextColor={theme.muted} style={[styles.messageInput,{color:theme.text}]}/><Pressable style={styles.send} onPress={()=>{if(message.trim()){setMessages([...messages,{text:message.trim(),mine:true}]);setMessage("");}}}><Text style={{color:"#fff",fontWeight:"900"}}>➤</Text></Pressable></View>
  </View></Screen>;
}
function Bubble({text,mine,theme}){return <View style={[styles.bubble,mine?styles.mine:styles.theirs,{backgroundColor:mine?colors.primary:theme.card}]}><Text style={{color:mine?"#fff":theme.text,fontSize:15}}>{text}</Text></View>;}
function MatchModal({visible,onClose,onChat,theme,gender,setGender,balance}){
  const matches=USERS.filter(p=>(gender==="الكل"||p.gender===gender)&&p.online);
  return <Modal visible={visible} transparent animationType="fade"><View style={styles.modalBg}><View style={[styles.modal,{backgroundColor:theme.card}]}><Text style={{fontSize:50}}>💜</Text><Text style={[styles.title,{color:theme.text,textAlign:"center"}]}>بحث سريع</Text><Text style={[styles.muted,{color:theme.muted,textAlign:"center"}]}>اختر الجنس للعثور على شخص يبحث الآن. فتح أول محادثة يكلف {GEM_COST} 💎.</Text><View style={styles.row}>{["الكل","ذكر","أنثى"].map(x=><Pressable key={x} onPress={()=>setGender(x)} style={[styles.choice,gender===x&&styles.activeChoice]}><Text style={{color:"#fff"}}>{x}</Text></Pressable>)}</View><Text style={[styles.gemCenter,{color:theme.text}]}>رصيدك: 💎 {balance}</Text>{matches.map(p=><Pressable key={p.id} onPress={()=>onChat(p)}><View style={styles.matchRow}><Avatar name={p.name} color={p.color} size={48}/><View style={{flex:1}}><Text style={[styles.name,{color:theme.text}]}>{p.name} • {p.age}</Text><Text style={[styles.muted,{color:theme.muted}]}>متصل الآن • {p.gender}</Text></View><Text style={styles.matchCost}>10 💎</Text></View></Pressable>)}{!matches.length&&<Text style={[styles.muted,{color:theme.muted,textAlign:"center",marginTop:15}]}>لا يوجد شخص مطابق متصل الآن.</Text>}<Pressable onPress={onClose}><Text style={styles.link}>إغلاق</Text></Pressable></View></View></Modal>;
}

const styles=StyleSheet.create({
  safe:{flex:1},page:{padding:18,paddingBottom:100},form:{padding:22,paddingTop:50},welcome:{flex:1,justifyContent:"center",alignItems:"center",padding:28},logo:{width:94,height:94,borderRadius:30,backgroundColor:"#6C63FF",alignItems:"center",justifyContent:"center",marginBottom:20},hero:{fontSize:42,fontWeight:"900"},subtitle:{fontSize:22,fontWeight:"800",marginTop:2},description:{textAlign:"center",lineHeight:25,fontSize:15,marginVertical:22},title:{fontSize:27,fontWeight:"900",marginBottom:12},section:{fontSize:20,fontWeight:"800",marginTop:20,marginBottom:12,textAlign:"right"},label:{fontSize:15,fontWeight:"800",marginTop:18,marginBottom:8,textAlign:"right"},input:{height:54,borderWidth:1,borderRadius:15,paddingHorizontal:15,marginTop:12,textAlign:"right",fontSize:15},button:{height:54,borderRadius:16,backgroundColor:"#6C63FF",alignItems:"center",justifyContent:"center",marginTop:16},secondaryButton:{backgroundColor:"transparent",borderWidth:1,borderColor:"#6C63FF"},buttonText:{color:"#fff",fontSize:16,fontWeight:"800"},secondaryText:{color:"#6C63FF"},link:{color:"#6C63FF",fontWeight:"800",marginTop:15,textAlign:"center"},header:{flexDirection:"row-reverse",justifyContent:"space-between",alignItems:"center",marginBottom:20},headerActions:{flexDirection:"row-reverse",alignItems:"center",gap:10},bigIcon:{fontSize:28},gemPill:{backgroundColor:"#241A55",borderRadius:18,paddingHorizontal:12,paddingVertical:8},gemText:{color:"#F5D0FE",fontWeight:"900"},heroCard:{backgroundColor:"#171C49",borderRadius:24,padding:22},heroCardTitle:{color:"#fff",fontSize:21,fontWeight:"900",textAlign:"right"},heroCardSub:{color:"#C7C9E8",marginTop:8,textAlign:"right",lineHeight:22},pill:{alignSelf:"flex-end",backgroundColor:"#D946EF",borderRadius:12,padding:10,marginTop:16},pillText:{color:"#fff",fontWeight:"800"},grid:{flexDirection:"row-reverse",flexWrap:"wrap",gap:10,marginTop:14},tile:{width:"48%",borderRadius:18,borderWidth:1,padding:15,minHeight:125},tileIcon:{fontSize:28},tileTitle:{fontWeight:"800",fontSize:16,marginTop:8},muted:{fontSize:13,marginTop:4},center:{textAlign:"center",marginTop:6,fontWeight:"700"},avatar:{alignItems:"center",justifyContent:"center"},card:{borderRadius:18,borderWidth:1,padding:13,marginBottom:10},person:{flexDirection:"row-reverse",alignItems:"center",gap:12},name:{fontSize:16,fontWeight:"800",textAlign:"right"},arrow:{fontSize:30,color:"#6C63FF"},nav:{position:"absolute",bottom:0,left:0,right:0,height:75,borderTopWidth:1,flexDirection:"row-reverse",justifyContent:"space-around",alignItems:"center",paddingBottom:Platform.OS==="ios"?10:0},navItem:{alignItems:"center"},navIcon:{fontSize:24},navText:{fontSize:10,marginTop:2},row:{flexDirection:"row-reverse",gap:8},choice:{flex:1,height:46,borderRadius:14,backgroundColor:"#6C63FF",alignItems:"center",justifyContent:"center",marginTop:5},activeChoice:{backgroundColor:"#6C63FF",borderColor:"#6C63FF"},wrap:{flexDirection:"row-reverse",flexWrap:"wrap",gap:8},smallChoice:{paddingHorizontal:18,height:44,borderWidth:1,borderRadius:13,alignItems:"center",justifyContent:"center"},postInput:{minHeight:90,textAlign:"right",textAlignVertical:"top",fontSize:15},postText:{fontSize:15,lineHeight:24,textAlign:"right",marginTop:12},postActions:{flexDirection:"row-reverse",justifyContent:"space-between",marginTop:15,paddingTop:12,borderTopWidth:1,borderTopColor:"#22314E"},mediaRow:{flexDirection:"row-reverse",gap:8,marginTop:12},mediaButton:{flex:1,borderWidth:1,borderColor:"#6C63FF",borderRadius:14,minHeight:46,alignItems:"center",justifyContent:"center",paddingHorizontal:5},mediaButtonText:{color:"#6C63FF",fontWeight:"800",fontSize:12,textAlign:"center"},mediaPreview:{height:220,borderRadius:16,borderWidth:1,overflow:"hidden",marginTop:12,position:"relative"},mediaImage:{width:"100%",height:"100%",resizeMode:"cover"},videoBox:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#0B1020"},videoIcon:{fontSize:42,color:"#fff"},videoLabel:{color:"#fff",fontWeight:"800",marginTop:8},removeMedia:{position:"absolute",top:8,right:8,width:32,height:32,borderRadius:16,backgroundColor:"rgba(0,0,0,.7)",alignItems:"center",justifyContent:"center"},tags:{flexDirection:"row-reverse",flexWrap:"wrap",gap:7,marginTop:10},tag:{color:"#A78BFA",fontWeight:"800"},infoBox:{borderWidth:1,borderColor:"#6C63FF",borderRadius:14,padding:12,marginTop:12,textAlign:"right",lineHeight:20},chatHeader:{height:70,borderBottomWidth:1,flexDirection:"row-reverse",alignItems:"center",padding:12,gap:10},callIcon:{fontSize:20},messages:{flexGrow:1,justifyContent:"flex-end",padding:18,gap:10},bubble:{maxWidth:"78%",padding:12,borderRadius:18},mine:{alignSelf:"flex-end",borderBottomRightRadius:5},theirs:{alignSelf:"flex-start",borderBottomLeftRadius:5},messageBar:{margin:10,borderWidth:1,borderRadius:18,flexDirection:"row-reverse",padding:5},messageInput:{flex:1,height:44,paddingHorizontal:12,textAlign:"right"},send:{width:42,height:42,borderRadius:14,backgroundColor:"#6C63FF",alignItems:"center",justifyContent:"center"},profile:{alignItems:"center",paddingVertical:15},profileName:{fontSize:25,fontWeight:"900",marginTop:12},bio:{textAlign:"center",fontSize:15,lineHeight:24,marginTop:12},profileActions:{marginTop:5},costNote:{textAlign:"center",lineHeight:21,marginTop:12},id:{fontSize:12,marginTop:5},rowButtons:{flexDirection:"row-reverse",gap:8,marginTop:15},action:{flex:1,alignItems:"center",padding:15,borderRadius:16},actionIcon:{fontSize:25,marginBottom:5},balance:{backgroundColor:"#171C49",borderRadius:24,padding:25,alignItems:"center"},balanceNumber:{color:"#fff",fontSize:34,fontWeight:"900",marginTop:8},balanceHint:{color:"#C7C9E8",marginTop:8},modalBg:{flex:1,backgroundColor:"rgba(0,0,0,.65)",justifyContent:"center",padding:18},modal:{borderRadius:24,padding:20,maxHeight:"90%"},gemCenter:{textAlign:"center",fontWeight:"900",marginTop:14},matchRow:{flexDirection:"row-reverse",alignItems:"center",gap:10,paddingVertical:12,borderBottomWidth:1,borderBottomColor:"#22314E"},matchCost:{color:"#F5D0FE",fontWeight:"900"},back:{fontSize:30,color:"#6C63FF",fontWeight:"900",marginBottom:8}
});

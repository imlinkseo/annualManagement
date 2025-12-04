"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ThProps } from "@/components/table/Th";
import ThTr from "@/components/table/ThTr";
import TdTr from "@/components/table/TdTr";
import { Special } from "@/types/types";
import { useToast } from "@/components/ui/Toast";
import InputText from "@/components/ui/InputText";
import { useSpecialStore } from "@/stores/specialStore";

const TITLE = `특수 연차 관리`;

export default function ManageSpecialPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { specials, loading, hasLoaded, refresh, setSpecials } =
    useSpecialStore();

  const [isOpen, setIsOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { showToast } = useToast();

  const initialNewSpecialData: Special = {
    name: ``,
    num: ``,
  };
  const [newSpecialData, setNewSpecialData] = useState<Special>(
    initialNewSpecialData
  );

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[34px] w-[1600px]`,
    buttonCtn: `w-full flex justify-center`,
    th: `hidden`,
    modalBtn: `px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all`,
  };

  // ✅ 이 탭에서 처음 진입했을 때만 서버에서 한 번 가져오기
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.id) {
        setPageLoading(false);
        return;
      }

      // 이미 한 번 불러온 탭이면 굳이 또 안 불러도 됨
      if (!hasLoaded) {
        await refresh();
      }

      if (!cancelled) setPageLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id, hasLoaded, refresh]);

  const onRenderModalContent = () => {
    const columns: ThProps[] = [
      { key: `title`, label: `이름`, width: `w-[140px]` },
      { key: `node`, label: `갯수`, width: `flex-1` },
    ];

    const rows = [
      [
        { key: `title`, content: `이름` },
        {
          key: `node`,
          content: (
            <InputText
              value={newSpecialData.name}
              onChangeValue={(value) => onChangeNewSpecialData("name", value)}
            />
          ),
        },
      ],
      [
        { key: `title`, content: `갯수` },
        {
          key: `node`,
          content: (
            <InputText
              value={newSpecialData.num}
              onChangeValue={(value) => onChangeNewSpecialData("num", value)}
            />
          ),
        },
      ],
    ];

    return (
      <TableContainer className="w-full border-neutral-300">
        <thead>
          <ThTr columns={columns} className={cn(styles.th)} />
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <TdTr key={i} columns={columns} row={row} />
          ))}
        </tbody>
      </TableContainer>
    );
  };

  function onChangeNewSpecialData(key: string, value: string) {
    setNewSpecialData((prev) => ({ ...prev, [key]: value }));
  }

  async function deleteSpecial(id: number) {
    if (!id) return;
    const { error } = await supabase
      .from("special")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("삭제 오류:", error.message);
      return;
    }
    setSpecials((prev) => prev.filter((item) => item.id !== id));
    showToast("삭제 되었습니다.");
  }

  async function registerNewSpecial(newSpecialData: Special) {
    const payload = {
      name: newSpecialData.name,
      num: Number(newSpecialData.num),
    };

    const { data, error } = await supabase
      .from("special")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      if (data) {
        setSpecials((prev) => [...prev, data as Special]);
      } else {
        await refresh();
      }
      setNewSpecialData(initialNewSpecialData);
      setIsOpen(false);
      showToast("등록 되었습니다.");
    }
  }

  function onClickDeleteButton(id: number) {
    deleteSpecial(id);
  }

  const columns: ThProps[] = [
    { key: `no`, label: `No`, width: `w-[120px]` },
    { key: `name`, label: `이름`, width: `flex-1` },
    { key: `num`, label: `갯수`, width: `flex-1` },
    { key: `del`, label: `삭제`, width: `w-[200px]` },
  ];

  function onMakeRow(specials: Special[]) {
    return specials.map((item, idx) => {
      const row = [
        { key: `no`, content: idx + 1 },
        { key: `name`, content: item.name },
        { key: `num`, content: item.num },
        {
          key: `del`,
          content: (
            <Button
              variant="red"
              text="삭제"
              onClick={() => {
                onClickDeleteButton(item?.id || 0);
              }}
            />
          ),
        },
      ];

      return <TdTr key={item.id} columns={columns} row={row} />;
    });
  }

  function onClickRegisterNewButton() {
    setIsOpen(true);
  }

  function onRegisterNew() {
    registerNewSpecial(newSpecialData);
  }

  const isPageLoading = pageLoading || (loading && !hasLoaded);

  // ✅ 로딩이 5초 이상 지속되면 자동 새로고침
  useEffect(() => {
    if (!isPageLoading) return;

    const timer = setTimeout(() => {
      // soft refresh (데이터 refetch용)
      router.refresh();
      // 만약 완전 새로고침이 더 안전하다면:
      // window.location.reload();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isPageLoading, router]);

  if (isPageLoading) return <LoadingSpinner />;

  return (
    <>
      <PageContainer className={cn(styles.ctn)}>
        <PageTitle title={TITLE} type="big" />
        <TableContainer>
          <thead>
            <ThTr columns={columns} />
          </thead>
          <tbody>{onMakeRow(specials)}</tbody>
        </TableContainer>
        <div className={cn(styles.buttonCtn)}>
          <Button
            variant="blue"
            text="신규 등록하기"
            onClick={onClickRegisterNewButton}
            className="w-[200px]"
          />
        </div>
      </PageContainer>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="특수 연차 등록"
        actions={
          <>
            <Button
              variant="blue"
              text="등록"
              onClick={onRegisterNew}
              className="px-[46px] py-[14px]"
            />
          </>
        }
      >
        {onRenderModalContent()}
      </Modal>
    </>
  );
}

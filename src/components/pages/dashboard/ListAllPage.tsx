"use client";
import { cn, isDeepEqual } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";

import { employee } from "@/types/types";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";

import Button from "@/components/ui/Button";

import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import ThTr from "@/components/table/ThTr";
import { status, vacation } from "@/types/types";
import Tab from "@/components/ui/Tab";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";

const TITLE = `전체 목록`;

export default function ListAllPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<status>("대기");
  const [employees, setEmployees] = useState<employee[] | null>(null);
  const [vacation, setVacation] = useState<vacation[] | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [refuseReason, setRefuseReason] = useState("");
  const { showToast } = useToast();

  const setEmployeeIfChanged = (next: employee[] | null) =>
    setEmployees((prev) => (isDeepEqual(prev, next) ? prev : next));

  const setVacationIfChanged = (next: vacation[] | null) =>
    setVacation((prev) => (isDeepEqual(prev, next) ? prev : next));

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("name, user_id");

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setEmployeeIfChanged(data ?? null);
    }
  };

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[34px] w-[1600px]`,
    modalBtn: `px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all`,
  };

  const fetchVacation = async () => {
    const { data, error } = await supabase
      .from("vacation")
      .select(
        "type, category, special, start_date, end_date, reason, status, id, user_id, refuse_reason, date_num"
      );

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setVacationIfChanged(data ?? null);
    }
  };

  useEffect(() => {
    if (!user) {
    } else {
      if (user?.id) {
        fetchEmployees();
        fetchVacation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const TAB_ITEMS = [
    {
      label: `대기중`,
      value: `대기` as status,
    },
    {
      label: `승인`,
      value: `승인` as status,
    },
    {
      label: `반려`,
      value: `반려` as status,
    },
  ];

  function onChangeStatus(value: status) {
    setStatus(value);
  }

  const WaitTable = () => {
    const columns: ThProps[] = [
      { key: `no`, label: `No`, width: `w-[100px]` },
      { key: `name`, label: `이름`, width: `flex-1` },
      { key: `type`, label: `연/반차`, width: `flex-1` },
      { key: `category`, label: `특수 여부`, width: `flex-1` },
      { key: `special`, label: `사용 특수 연차명`, width: `flex-1` },
      { key: `start_date`, label: `시작일`, width: `flex-1` },
      { key: `end_date`, label: `종료일`, width: `flex-1` },
      { key: `reason`, label: `사유`, width: `flex-1` },
      { key: `approval`, label: `승인`, width: `w-[100px]` },
      { key: `refuse`, label: `반려`, width: `w-[100px]` },
    ];

    async function onClickApprovalButton(item: vacation) {
      const dateNum = item.date_num === undefined ? 0 : parseInt(item.date_num);
      const { data: updated, error: upErr } = await supabase
        .from("vacation")
        .update({ status: "승인" })
        .eq("id", item.id)
        .eq("status", "대기")
        .select("id, status")
        .maybeSingle();

      if (upErr) {
        showToast(`승인 실패: ${upErr.message}`);
        return;
      }
      if (!updated) {
        showToast("이미 처리된 신청서입니다.");
        return;
      }

      if (dateNum > 0) {
        const { data: emp, error: empErr } = await supabase
          .from("employees")
          .select("vacation_used, vacation_rest")
          .eq("user_id", item.user_id)
          .single();

        if (empErr) {
          showToast(`직원 정보 조회 실패: ${empErr.message}`);
          return;
        }

        const nextUsed = Number(emp.vacation_used ?? 0) + dateNum;
        const nextRest = Number(emp.vacation_rest ?? 0) - dateNum;

        const { error: updEmpErr } = await supabase
          .from("employees")
          .update({ vacation_used: nextUsed, vacation_rest: nextRest })
          .eq("user_id", item.user_id);

        if (updEmpErr) {
          showToast(`직원 연차 반영 실패: ${updEmpErr.message}`);
          return;
        }
      }

      setVacationIfChanged(
        (vacation ?? []).map((v) =>
          v.id === item.id ? { ...v, status: "승인" } : v
        )
      );
      showToast("승인 처리되었습니다.");
    }

    function onClickRefuseButton(id: string) {
      setSelectedId(id);
      setOpen(true);
    }

    function onMakeRow(status: status) {
      return vacation
        ?.filter((item) => item.status === status)
        .map((filtered, idx) => {
          const row = [
            { key: "no", content: idx + 1 },
            {
              key: "name",
              content: employees?.filter(
                (employee) => filtered.user_id === employee.user_id
              )[0].name,
            },
            ...Object.entries(filtered)
              .map(([key, value]) => {
                if (
                  key !== "status" &&
                  key !== "user_id" &&
                  key !== "id" &&
                  key !== "refuse_reason" &&
                  key !== "date_num"
                ) {
                  return { key, content: value === null ? `` : value };
                }
              })
              .filter((cell) => cell !== undefined),
            {
              key: "approval",
              content: (
                <Button
                  variant="green"
                  text="승인"
                  onClick={() => onClickApprovalButton(filtered)}
                />
              ),
            },
            {
              key: "refuse",
              content: (
                <Button
                  variant="red"
                  text="반려"
                  onClick={() => onClickRefuseButton(filtered.id as string)}
                />
              ),
            },
          ];

          return <TdTr key={String(filtered.id)} columns={columns} row={row} />;
        });
    }

    return (
      <TableContainer>
        <thead>
          <ThTr columns={columns} />
        </thead>
        <tbody>{onMakeRow(status)}</tbody>
      </TableContainer>
    );
  };

  const ApprovalTable = () => {
    const columns: ThProps[] = [
      { key: `no`, label: `No`, width: `w-[100px]` },
      { key: `name`, label: `이름`, width: `flex-1` },
      { key: `type`, label: `연/반차`, width: `flex-1` },
      { key: `category`, label: `특수 여부`, width: `flex-1` },
      { key: `special`, label: `사용 특수 연차명`, width: `flex-1` },
      { key: `start_date`, label: `시작일`, width: `flex-1` },
      { key: `end_date`, label: `종료일`, width: `flex-1` },
      { key: `reason`, label: `사유`, width: `flex-1` },
    ];

    function onMakeRow(status: status) {
      return vacation
        ?.filter((item) => item.status === status)
        .map((filtered, idx) => {
          const row = [
            { key: "no", content: idx + 1 },
            {
              key: "name",
              content: employees?.filter(
                (employee) => filtered.user_id === employee.user_id
              )[0].name,
            },
            ...Object.entries(filtered)
              .map(([key, value]) => {
                if (
                  key !== "status" &&
                  key !== "user_id" &&
                  key !== "id" &&
                  key !== "refuse_reason"
                ) {
                  return { key, content: value === null ? `` : value };
                }
              })
              .filter((cell) => cell !== undefined),
          ];

          return <TdTr key={String(filtered.id)} columns={columns} row={row} />;
        });
    }

    return (
      <TableContainer>
        <thead>
          <ThTr columns={columns} />
        </thead>
        <tbody>{onMakeRow(status)}</tbody>
      </TableContainer>
    );
  };

  const RefuseTable = () => {
    const columns: ThProps[] = [
      { key: `no`, label: `No`, width: `w-[100px]` },
      { key: `name`, label: `이름`, width: `flex-1` },
      { key: `type`, label: `연/반차`, width: `flex-1` },
      { key: `category`, label: `특수 여부`, width: `flex-1` },
      { key: `special`, label: `사용 특수 연차명`, width: `flex-1` },
      { key: `start_date`, label: `시작일`, width: `flex-1` },
      { key: `end_date`, label: `종료일`, width: `flex-1` },
      { key: `reason`, label: `사유`, width: `flex-1` },
      { key: `refuse_reason`, label: `반려 사유`, width: `flex-1` },
    ];

    function onMakeRow(status: status) {
      return vacation
        ?.filter((item) => item.status === status)
        .map((filtered, idx) => {
          const row = [
            { key: "no", content: idx + 1 },
            {
              key: "name",
              content: employees?.filter(
                (employee) => filtered.user_id === employee.user_id
              )[0].name,
            },
            ...Object.entries(filtered)
              .map(([key, value]) => {
                if (key !== "status" && key !== "user_id" && key !== "id") {
                  return { key, content: value === null ? `` : value };
                }
              })
              .filter((cell) => cell !== undefined),
          ];

          return <TdTr key={String(filtered.id)} columns={columns} row={row} />;
        });
    }

    return (
      <TableContainer>
        <thead>
          <ThTr columns={columns} />
        </thead>
        <tbody>{onMakeRow(status)}</tbody>
      </TableContainer>
    );
  };

  function onRenderTable(status: status) {
    switch (status) {
      case "대기": {
        return <WaitTable />;
      }
      case "승인": {
        return <ApprovalTable />;
      }
      case "반려": {
        return <RefuseTable />;
      }
      default: {
        return <WaitTable />;
      }
    }
  }

  async function onClickRefuseModalButton() {
    if (!selectedId) return;
    const { error } = await supabase
      .from("vacation")
      .update({ status: "반려", refuse_reason: refuseReason })
      .eq("id", selectedId);
    if (error) {
      showToast(`반려 실패: ${error.message}`);
      return;
    }
    setVacationIfChanged(
      (vacation ?? []).map((v) =>
        v.id === selectedId
          ? { ...v, status: "반려", refuse_reason: refuseReason }
          : v
      )
    );
    setRefuseReason("");
    setSelectedId(null);
    setOpen(false);
    showToast("반려 처리 되었습니다.");
  }

  if (!vacation) return <LoadingSpinner />;

  return (
    <>
      <PageContainer className={cn(styles.ctn)}>
        <PageTitle title={TITLE} type="big" />
        <Tab
          items={TAB_ITEMS}
          currentValue={status}
          onChange={onChangeStatus}
        />
        {onRenderTable(status)}
      </PageContainer>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="반려 사유 입력"
        actions={
          <>
            <Button
              variant="white"
              text="뒤로가기"
              onClick={() => setOpen(false)}
            />
            <Button
              variant="blue"
              text="반려처리"
              onClick={onClickRefuseModalButton}
              className="px-[32px] py-[14px]"
            />
          </>
        }
      >
        <Textarea
          className="h-[240px]"
          value={refuseReason}
          onChange={(e) => setRefuseReason(e.currentTarget.value)}
        />
      </Modal>
    </>
  );
}
